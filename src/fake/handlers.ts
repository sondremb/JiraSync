import { http, HttpResponse } from "msw";
import type { paths as BekkPaths } from "../generated/bekk-timekeeper";
import type { paths as JiraPaths } from "../generated/jira-issues";
import { IsoDate } from "../date-time/IsoWeek";
import { jiraBaseUrl } from "../data/jira/jiraclient";
import { jiraAuthPaths } from "../login/jira/authPaths";
import { config } from "../Utils/envUtils";
import { fakeBekkAccount } from "./fakeAccount";
import { fakeBekkAccessToken } from "./fakeMsal";
import type { FakeStore } from "./fakeStore";
import { readFakeSettings, writeFakeSettings } from "./settings";
import type { SignedOvertime } from "../overtime/overtime";

/** The 200 JSON body of an operation in the generated API types. */
type Ok<Operation> = Operation extends {
	responses: { 200: { content: { "application/json": infer Body } } };
}
	? Body
	: never;
type Jira<P extends keyof JiraPaths, M extends keyof JiraPaths[P]> = Ok<
	JiraPaths[P][M]
>;
type Bekk<P extends keyof BekkPaths, M extends keyof BekkPaths[P]> = Ok<
	BekkPaths[P][M]
>;

export const fakeJiraAccessToken = "fake-jira-access-token";

const jira = (path: string) => `${jiraBaseUrl}${path}`;
const bekk = (path: string) => `${config.bekk.baseUrl}${path}`;

const unauthorized = () => new HttpResponse(null, { status: 401 });
const hasToken = (request: Request, token: string) =>
	request.headers.get("Authorization") === `Bearer ${token}`;

type ResolverInfo = { request: Request; params: Record<string, unknown> };
type Resolver<T> = (info: T) => Response | Promise<Response>;

/**
 * Answers 401 unless the request carries the fake token, so the app's real
 * auth middleware (and the Jira 401 retry) runs against the fake. `check` can
 * reject the request for other reasons.
 */
const authorized =
	(token: string, check?: (info: ResolverInfo) => Response | undefined) =>
	<T extends ResolverInfo>(resolver: Resolver<T>): Resolver<T> =>
	(info) =>
		hasToken(info.request, token)
			? (check?.(info) ?? resolver(info))
			: unauthorized();

/** Per-page size for Jira worklogs, small so the app's paging is exercised. */
const worklogPageSize = 3;

export function createHandlers(store: FakeStore) {
	return [...authHandlers(), ...jiraHandlers(store), ...bekkHandlers(store)];
}

/** The Netlify functions behind Jira login, with the session state in sessionStorage. */
function authHandlers() {
	return [
		http.get(jiraAuthPaths.session, () => {
			if (readFakeSettings(sessionStorage)?.loggedOut) return unauthorized();
			return HttpResponse.json({
				accessToken: fakeJiraAccessToken,
				expiresIn: 3600,
			});
		}),
		http.post(jiraAuthPaths.logout, () => {
			const settings = readFakeSettings(sessionStorage);
			if (settings) {
				writeFakeSettings(sessionStorage, { ...settings, loggedOut: true });
			}
			return new HttpResponse(null, { status: 200 });
		}),
	];
}

function jiraHandlers(store: FakeStore) {
	const jiraAuthorized = authorized(fakeJiraAccessToken);

	return [
		http.get(
			jira("/rest/api/3/myself"),
			jiraAuthorized(() =>
				HttpResponse.json<Jira<"/rest/api/3/myself", "get">>({
					accountId: store.accountId,
					displayName: store.displayName,
				}),
			),
		),

		http.get(
			jira("/rest/api/3/search/jql"),
			jiraAuthorized(({ request }) => {
				// The app asks for `worklogDate >= "from" AND worklogDate <= "to" AND worklogAuthor = currentUser()`
				const jql = new URL(request.url).searchParams.get("jql") ?? "";
				const from = /worklogDate >= "([^"]+)"/.exec(jql)?.[1];
				const to = /worklogDate <= "([^"]+)"/.exec(jql)?.[1];
				if (!from || !to) {
					return HttpResponse.json(
						{ errorMessages: [`The fake backend can't search for: ${jql}`] },
						{ status: 400 },
					);
				}
				const issueIds = new Set(
					store
						.worklogsBetween(IsoDate.parse(from), IsoDate.parse(to))
						.filter((log) => log.authorAccountId === store.accountId)
						.map((log) => log.issueId),
				);
				return HttpResponse.json<Jira<"/rest/api/3/search/jql", "get">>({
					issues: [...issueIds].map((id) => ({ id: String(id) })),
					isLast: true,
				});
			}),
		),

		http.get(
			jira("/rest/api/3/issue/:issueIdOrKey"),
			jiraAuthorized(({ params }) => {
				const idOrKey = String(params.issueIdOrKey);
				const issue = store
					.issues()
					.find((i) => String(i.id) === idOrKey || i.key === idOrKey);
				if (!issue) {
					return HttpResponse.json(
						{ errorMessages: [`No fake issue ${idOrKey}`] },
						{ status: 404 },
					);
				}
				return HttpResponse.json<
					Jira<"/rest/api/3/issue/{issueIdOrKey}", "get">
				>({
					id: String(issue.id),
					key: issue.key,
					fields: { summary: issue.summary },
				});
			}),
		),

		http.get(
			jira("/rest/api/3/issue/:issueIdOrKey/worklog"),
			jiraAuthorized(({ request, params }) => {
				const query = new URL(request.url).searchParams;
				const after = Number(query.get("startedAfter") ?? 0);
				const before = Number(
					query.get("startedBefore") ?? Number.MAX_SAFE_INTEGER,
				);
				const startAt = Number(query.get("startAt") ?? 0);
				const issue = store
					.issues()
					.find(
						(i) =>
							String(i.id) === params.issueIdOrKey ||
							i.key === params.issueIdOrKey,
					);
				if (!issue) return new HttpResponse(null, { status: 404 });
				const worklogs = store
					.worklogsForIssue(issue.id)
					.filter(
						(log) =>
							log.started.getTime() >= after && log.started.getTime() < before,
					);
				return HttpResponse.json<
					Jira<"/rest/api/3/issue/{issueIdOrKey}/worklog", "get">
				>({
					startAt,
					maxResults: worklogPageSize,
					total: worklogs.length,
					worklogs: worklogs
						.slice(startAt, startAt + worklogPageSize)
						.map((log) => ({
							id: String(log.id),
							issueId: String(log.issueId),
							author: { accountId: log.authorAccountId },
							started: log.started.toISOString(),
							timeSpentSeconds: Math.round(log.hours * 3600),
						})),
				});
			}),
		),

		http.post(
			jira("/rest/api/3/jql/match"),
			jiraAuthorized(async ({ request }) => {
				const body = (await request.json()) as {
					issueIds: number[];
					jqls: string[];
				};
				return HttpResponse.json<Jira<"/rest/api/3/jql/match", "post">>({
					matches: store.matchJqls(body.issueIds, body.jqls),
				});
			}),
		),

		http.post(
			jira("/rest/api/3/jql/parse"),
			jiraAuthorized(async ({ request }) => {
				const body = (await request.json()) as { queries: string[] };
				return HttpResponse.json<Jira<"/rest/api/3/jql/parse", "post">>({
					queries: body.queries.map((query) => ({
						query,
						errors: store.jqlSyntaxErrors(query),
					})),
				});
			}),
		),

		http.get(
			jira("/rest/api/3/project/search"),
			jiraAuthorized(({ request }) => {
				const query = new URL(request.url).searchParams;
				const startAt = Number(query.get("startAt") ?? 0);
				const maxResults = Number(query.get("maxResults") ?? 50);
				const projects = store.projects();
				const page = projects.slice(startAt, startAt + maxResults);
				return HttpResponse.json<Jira<"/rest/api/3/project/search", "get">>({
					startAt,
					maxResults,
					total: projects.length,
					isLast: startAt + page.length >= projects.length,
					values: page.map((p) => ({ key: p.key, name: p.name })),
				});
			}),
		),
	];
}

function bekkHandlers(store: FakeStore) {
	// Bekk calls also need the fake employee's id, where they name one.
	const bekkAuthorized = authorized(
		fakeBekkAccessToken,
		({ request, params }) => {
			const employeeId =
				params.employeeId ??
				new URL(request.url).searchParams.get("employeeId");
			return employeeId != null &&
				Number(employeeId) !== fakeBekkAccount.employeeId
				? new HttpResponse(null, { status: 403 })
				: undefined;
		},
	);

	const timecodeName = (id: number) =>
		store.timecodes().find((t) => t.id === id)?.name ?? `Timekode ${id}`;

	return [
		http.get(
			bekk("/v3/timesheets/employees/:employeeId"),
			bekkAuthorized(({ request }) => {
				const query = new URL(request.url).searchParams;
				const from = IsoDate.parse(query.get("From") ?? "");
				const to = IsoDate.parse(query.get("To") ?? "");
				const byTimecode = new Map<
					number,
					{ date: IsoDate; hours: number }[]
				>();
				for (const entry of store.bekkEntries(from, to)) {
					byTimecode.set(entry.timecodeId, [
						...(byTimecode.get(entry.timecodeId) ?? []),
						entry,
					]);
				}
				return HttpResponse.json<
					Bekk<"/v3/timesheets/employees/{employeeId}", "get">
				>({
					timecodeTimeEntries: [...byTimecode].map(([timecodeId, entries]) => ({
						timecode: { id: timecodeId, name: timecodeName(timecodeId) },
						entries: entries.map((entry) => ({
							employeeId: fakeBekkAccount.employeeId,
							timecodeId,
							// Like Bekk: a calendar day without an offset
							date: `${entry.date}T00:00:00`,
							hours: entry.hours,
						})),
					})),
				});
			}),
		),

		http.put(
			bekk("/timesheets/employee/:employeeId"),
			bekkAuthorized(async ({ request }) => {
				const body = (await request.json()) as {
					timecodeId: number;
					date: string;
					hours: number;
				};
				const validationInfo = store.writeBekkHours(
					IsoDate.parse(body.date),
					body.timecodeId,
					body.hours,
				);
				return HttpResponse.json<
					Bekk<"/timesheets/employee/{employeeId}", "put">
				>({ validationInfo });
			}),
		),

		http.delete(
			bekk("/timesheets/employee/:employeeId"),
			bekkAuthorized(async ({ request }) => {
				const body = (await request.json()) as {
					timecodeId: number;
					date: string;
				};
				const errors = store.writeBekkHours(
					IsoDate.parse(body.date),
					body.timecodeId,
					0,
				);
				return errors.length === 0
					? new HttpResponse(null, { status: 200 })
					: HttpResponse.json({ errors }, { status: 400 });
			}),
		),

		http.get(
			bekk("/timesheets/lockdates/:employeeId"),
			bekkAuthorized(() => {
				const lockDate = store.lockDate();
				return HttpResponse.json<
					Bekk<"/timesheets/lockdates/{employeeId}", "get">
				>({
					employeeId: fakeBekkAccount.employeeId,
					// Noon in Norway, so the date is the same in any browser timezone
					lockDate: lockDate
						? IsoDate.toDate(lockDate).toISOString()
						: undefined,
				});
			}),
		),

		http.put(
			bekk("/timesheets/lockhours"),
			bekkAuthorized(async ({ request }) => {
				const lockDate = new URL(request.url).searchParams.get("lockDate");
				if (!lockDate) return new HttpResponse(null, { status: 400 });
				const text = await request.text();
				const signed = text ? (JSON.parse(text) as SignedOvertime) : undefined;
				const errors = store.lockHours(
					IsoDate.parse(lockDate.slice(0, 10)),
					signed,
				);
				if (errors.length > 0) {
					// Like Bekk's error body, without the developer details.
					return HttpResponse.json(
						{
							appname: "timekeeper-svc",
							userMessage: errors[0],
							statusCode: 400,
						},
						{ status: 400 },
					);
				}
				return HttpResponse.json<Bekk<"/timesheets/lockhours", "put">>({
					timesheetSuccessfullyLocked: true,
					userMessage: "Timesheet was successfully locked",
					timesheetLockDate: IsoDate.toDate(store.lockDate()!).toISOString(),
				});
			}),
		),

		http.get(
			bekk("/overtime/employees/:employeeId/summary"),
			bekkAuthorized(({ request }) => {
				const params = new URL(request.url).searchParams;
				const month = {
					year: Number(params.get("year")),
					month: Number(params.get("month")),
				};
				const summary = store.overtimeSummary(month);
				return HttpResponse.json<
					Bekk<"/overtime/employees/{employeeId}/summary", "get">
				>({
					...month,
					fromWeek: summary.fromWeek,
					toWeek: summary.toWeek,
					flexBalanceHours: summary.flexBalanceHours,
					overtimeHours: summary.overtimeHours,
					hoursForSigning: {
						mandatoryPayout: summary.mandatoryPayout,
						mandatoryFlex: summary.mandatoryFlex,
						allocatable: summary.allocatable,
						...(summary.halfYearClearing && {
							halfYearFlexClearing: {
								flexBalanceForPayout: summary.halfYearClearing.payout,
								flexBalanceForDeletion: summary.halfYearClearing.deletion,
							},
						}),
					},
				});
			}),
		),

		http.get(
			bekk("/v3/timecodes"),
			bekkAuthorized(({ request }) => {
				const ids = new URL(request.url).searchParams.getAll("Ids").map(Number);
				const timecodes =
					ids.length === 0
						? store.timecodes()
						: store.timecodes().filter((t) => ids.includes(t.id));
				return HttpResponse.json<Bekk<"/v3/timecodes", "get">>(
					timecodes.map((t) => ({ ...t })),
				);
			}),
		),
	];
}
