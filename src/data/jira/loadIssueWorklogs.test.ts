import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../date-time/IsoWeek";
import { JiraIssueId } from "../../reconciliation/entities";
import { jiraClient } from "./jiraclient";
import { loadIssueWorklogs } from "./loadIssueWorklogs";

vi.mock("./jiraclient", () => ({ jiraClient: { GET: vi.fn() } }));
const get = vi.mocked(jiraClient.GET);
const from = IsoDate.parse("2025-02-03");
const to = IsoDate.parse("2025-02-04");
const issueId = 101 as JiraIssueId;
const ok = (data: unknown) => ({ response: { ok: true }, data }) as never;

beforeEach(() => {
	get.mockReset();
});

describe("loadIssueWorklogs", () => {
	test("loads every page and keeps only the employee's work inside the requested dates", async () => {
		get
			.mockResolvedValueOnce(
				ok({
					startAt: 0,
					total: 3,
					worklogs: [
						{
							author: { accountId: "me" },
							started: "2025-02-03T12:00:00+0100",
							timeSpentSeconds: 3600,
						},
					],
				}),
			)
			.mockResolvedValueOnce(
				ok({
					startAt: 1,
					total: 3,
					worklogs: [
						{
							author: { accountId: "other" },
							started: "2025-02-03T12:00:00+0100",
							timeSpentSeconds: 7200,
						},
						{
							author: { accountId: "me" },
							started: "2025-02-05T12:00:00+0100",
							timeSpentSeconds: 7200,
						},
					],
				}),
			);

		await expect(loadIssueWorklogs(issueId, from, to, "me")).resolves.toEqual([
			{ issueId, date: from, hoursWorked: 1 },
		]);
		expect(get).toHaveBeenCalledTimes(2);
		expect(get).toHaveBeenLastCalledWith(
			"/rest/api/3/issue/{issueIdOrKey}/worklog",
			{
				params: {
					path: { issueIdOrKey: "101" },
					query: {
						startedAfter: expect.any(Number),
						startedBefore: expect.any(Number),
						startAt: 1,
					},
				},
			},
		);
	});

	test("rejects an empty page when more worklogs remain", async () => {
		get.mockResolvedValue(ok({ startAt: 0, total: 2, worklogs: [] }));
		await expect(loadIssueWorklogs(issueId, from, to, "me")).rejects.toThrow(
			"Incomplete worklogs",
		);
	});

	test("rejects a worklog missing hours rather than assuming zero", async () => {
		get.mockResolvedValue(
			ok({
				startAt: 0,
				total: 1,
				worklogs: [
					{ author: { accountId: "me" }, started: "2025-02-03T12:00:00+0100" },
				],
			}),
		);
		await expect(loadIssueWorklogs(issueId, from, to, "me")).rejects.toThrow(
			"Invalid worklog",
		);
	});
});
