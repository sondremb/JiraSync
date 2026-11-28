import { beforeEach, describe, expect, test, vi } from "vitest";
import { JiraIssueId } from "../../../src/reconciliation/entities";
import { jiraClient } from "../../../src/data/jira/jiraclient";
import { loadIssueSummary } from "../../../src/data/jira/loadIssueSummary";

vi.mock("../../../src/data/jira/jiraclient", () => ({
	jiraClient: { GET: vi.fn() },
}));
const get = vi.mocked(jiraClient.GET);
const issueId = 101 as JiraIssueId;
const respond = (ok: boolean, data: unknown) =>
	({ response: { ok }, data }) as never;

beforeEach(() => {
	get.mockReset();
});

describe("loadIssueSummary", () => {
	test("asks only for the summary and returns it with the key", async () => {
		get.mockResolvedValueOnce(
			respond(true, { key: "PASX-412", fields: { summary: "Ny flyt" } }),
		);
		await expect(loadIssueSummary(issueId)).resolves.toEqual({
			key: "PASX-412",
			summary: "Ny flyt",
		});
		expect(get).toHaveBeenCalledWith("/rest/api/3/issue/{issueIdOrKey}", {
			params: {
				path: { issueIdOrKey: "101" },
				query: { fields: ["summary"] },
			},
		});
	});

	test("fails on an error response or a missing key or summary", async () => {
		get.mockResolvedValueOnce(respond(false, undefined));
		await expect(loadIssueSummary(issueId)).rejects.toThrow("101");
		get.mockResolvedValueOnce(respond(true, { fields: { summary: "x" } }));
		await expect(loadIssueSummary(issueId)).rejects.toThrow("101");
		get.mockResolvedValueOnce(respond(true, { key: "PASX-1", fields: {} }));
		await expect(loadIssueSummary(issueId)).rejects.toThrow("101");
	});
});
