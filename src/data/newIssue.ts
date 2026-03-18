import createClient, { Middleware } from "openapi-fetch";
import { paths } from "../generated/jira-issues";
import { IsoDate } from "../date-time/IsoWeek";
import {
	CUSTOM_FIELDS,
	JiraAccountId,
	JiraIssue,
	JiraIssueId,
	JiraIssueKey,
	Worklog,
} from "./issue";
import { useQueries, useQuery } from "@tanstack/react-query";
import { jiraAuthenticationContext } from "../login/jira/authContext";

function getBaseUrl() {
	const cloudId = import.meta.env.VITE_ATLASSIAN_CLOUD_ID;
	if (!cloudId) {
		throw new Error("VITE_ATLASSIAN_CLOUD_ID must be set");
	}
	return `https://api.atlassian.com/ex/jira/${cloudId}`;
}

const authMiddleWare: Middleware = {
	async onRequest({ request }) {
		const authResult = await jiraAuthenticationContext.getAccessToken();
		if (authResult.kind !== "authenticated") {
			throw new Error("User is not authenticated");
		}

		request.headers.set("Authorization", `Bearer ${authResult.accessToken}`);
		return request;
	},
};

const client = createClient<paths>({
	baseUrl: getBaseUrl(),
});
client.use(authMiddleWare);

export function useIssue(issueKey: JiraIssueKey) {
	const { data } = useQuery({
		queryKey: ["jira", "issue", issueKey],
		queryFn: () =>
			client.GET("/rest/api/3/issue/{issueIdOrKey}", {
				params: {
					path: {
						issueIdOrKey: issueKey,
					},
				},
			}),
		staleTime: 1000 * 60 * 60, // 1 hour
	});
	return data?.data ?? null;
}

export function useIssues(issueKeys: JiraIssueKey[]): JiraIssue[] {
	const results = useQueries({
		queries: issueKeys.map((key) => ({
			queryKey: ["jira", "issue", key],
			queryFn: () =>
				client.GET("/rest/api/3/issue/{issueIdOrKey}", {
					params: {
						path: {
							issueIdOrKey: key,
						},
					},
				}),
			staleTime: 1000 * 60 * 60, // 1 hour
		})),
	});
	if (!results.every((result) => result.data !== undefined)) {
		return [];
	}
	return results
		.filter((result) => result.data?.data !== undefined)
		.map((result) => mapIssue(result.data!.data!));
}
type JiraIssueResponse =
	paths["/rest/api/3/issue/{issueIdOrKey}"]["get"]["responses"]["200"]["content"]["application/json"];
function mapIssue(response: JiraIssueResponse): JiraIssue {
	const fields = response.fields as unknown as Record<string, any>; // Jira's API is not well-typed, so we have to do some manual type assertions
	return {
		key: response.key!,
		epicLink: fields[CUSTOM_FIELDS.epicLink] ?? null,
		components: fields.components?.map((c: any) => c.id) ?? [],
	};
}

export function useWorkedIssues(fromDate: IsoDate, toDate: IsoDate) {
	const { data } = useQuery({
		queryKey: ["worklogs", fromDate, toDate],
		queryFn: () =>
			client.GET("/rest/api/3/search/jql", {
				params: {
					query: {
						jql: `worklogDate >= "${fromDate}" AND worklogDate <= "${toDate}" AND worklogAuthor = currentUser()`,
						expand: "key",
					},
				},
			}),
		staleTime: 1000 * 60, // 1 minute
	});
	return data?.data?.issues ?? [];
}

export function useWorklogs(fromDate: IsoDate, toDate: IsoDate): Worklog[] {
	const workedIssues = useWorkedIssues(fromDate, toDate);
	const loggedInUser = useJiraAccount();
	const results = useQueries({
		queries: workedIssues.map((issue) => ({
			queryKey: ["jira", "worklogs", issue.key],
			queryFn: () =>
				getIssueWorklogs(issue.key as JiraIssueKey, fromDate, toDate),
			enabled: issue.key !== undefined,
			staleTime: 1000 * 60,
		})),
	});
	if (!results.every((result) => result.data !== undefined)) {
		return [];
	}
	const allWorklogs = results.flatMap((result) => result.data ?? []);
	return allWorklogs.filter(
		(worklog) => worklog.authhorAccountId === loggedInUser?.accountId,
	);
}

export async function getIssueWorklogs(
	issueKey: JiraIssueKey,
	fromDate: IsoDate,
	toDate: IsoDate,
): Promise<Worklog[]> {
	const startedAfter = IsoDate.toDate(fromDate).getTime();
	const startedBefore = IsoDate.toDate(toDate).getTime();
	const { data, response } = await client.GET(
		"/rest/api/3/issue/{issueIdOrKey}/worklog",
		{
			params: {
				path: { issueIdOrKey: issueKey },
				query: { startedAfter, startedBefore },
			},
		},
	);
	if (!response.ok) {
		console.error(
			`Failed to fetch worklogs for issue ${issueKey}: ${response.status} ${response.statusText}`,
		);
		return [];
	}
	return (
		data?.worklogs?.map((worklog) => ({
			authhorAccountId: worklog.author?.accountId as JiraAccountId,
			issueId: worklog.issueId as JiraIssueId,
			issueKey,
			startDate: IsoDate.fromDate(new Date(worklog.started!)),
			timeSpentSeconds: worklog.timeSpentSeconds ?? 0,
		})) ?? []
	);
}

export function useJiraAccount() {
	const { data } = useQuery({
		queryKey: ["jira", "account"],
		queryFn: () => client.GET("/rest/api/3/myself"),
		staleTime: Infinity,
	});
	return data?.data;
}
