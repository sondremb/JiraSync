import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../../src/date-time/IsoWeek";
import { jiraClient } from "../../../src/data/jira/jiraclient";
import { loadWorkedIssueIds } from "../../../src/data/jira/loadWorkedIssueIds";

vi.mock("../../../src/data/jira/jiraclient", () => ({ jiraClient: { GET: vi.fn() } }));
const get = vi.mocked(jiraClient.GET);
const from = IsoDate.parse("2025-02-03");
const to = IsoDate.parse("2025-02-04");
const ok = (data: unknown) => ({ response: { ok: true }, data }) as never;

beforeEach(() => {
	get.mockReset();
});

describe("loadWorkedIssueIds", () => {
	test("fetches every page and deduplicates issues", async () => {
		get
			.mockResolvedValueOnce(
				ok({ issues: [{ id: "101" }], isLast: false, nextPageToken: "next" }),
			)
			.mockResolvedValueOnce(
				ok({ issues: [{ id: "101" }, { id: "102" }], isLast: true }),
			);

		await expect(loadWorkedIssueIds(from, to)).resolves.toEqual([101, 102]);
		expect(get).toHaveBeenCalledTimes(2);
		expect(get).toHaveBeenLastCalledWith("/rest/api/3/search/jql", {
			params: {
				query: {
					jql: `worklogDate >= "${from}" AND worklogDate <= "${to}" AND worklogAuthor = currentUser()`,
					fields: ["id"],
					nextPageToken: "next",
				},
			},
		});
	});

	test("rejects a non-final page without a continuation token", async () => {
		get.mockResolvedValue(ok({ issues: [{ id: "101" }], isLast: false }));
		await expect(loadWorkedIssueIds(from, to)).rejects.toThrow(
			"Incomplete Jira issue search",
		);
	});

	test("rejects a repeated continuation token", async () => {
		get.mockResolvedValue(
			ok({ issues: [], isLast: false, nextPageToken: "same" }),
		);
		await expect(loadWorkedIssueIds(from, to)).rejects.toThrow(
			"Repeated Jira issue page",
		);
	});

	test("rejects an issue without a usable ID", async () => {
		get.mockResolvedValue(ok({ issues: [{}], isLast: true }));
		await expect(loadWorkedIssueIds(from, to)).rejects.toThrow(
			"Invalid Jira issue ID",
		);
	});
});
