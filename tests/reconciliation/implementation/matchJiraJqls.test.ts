import { beforeEach, describe, expect, test, vi } from "vitest";
import { jiraClient } from "../../../src/data/jira/jiraclient";
import { Jql } from "../../../src/rules";
import { JiraIssueId } from "../../../src/reconciliation/entities";
import { matchJqls } from "../../../src/data/jira/matchJqls";

vi.mock("../../../src/data/jira/jiraclient", () => ({
	jiraClient: { POST: vi.fn() },
}));

const issues = [101 as JiraIssueId, 102 as JiraIssueId];
const jqls = ["project = 'PASX'" as Jql, "project = 'OTHER'" as Jql];
const post = vi.mocked(jiraClient.POST);

beforeEach(() => post.mockReset());

describe("matchJqls", () => {
	test("sends one batch and returns Jira's ordered match results", async () => {
		const matches = [
			{ matchedIssues: [101], errors: [] },
			{ matchedIssues: [], errors: [] },
		];
		post.mockResolvedValue({
			response: { ok: true },
			data: { matches },
		} as never);

		await expect(matchJqls(issues, jqls)).resolves.toEqual([
			{ matchedIssues: [101] },
			{ matchedIssues: [] },
		]);
		expect(post).toHaveBeenCalledExactlyOnceWith("/rest/api/3/jql/match", {
			body: { issueIds: issues, jqls },
		});
	});

	test.each([
		{ response: { ok: false }, data: { matches: [] } },
		{ response: { ok: true }, data: undefined },
	])("rejects unsuccessful or missing response data", async (result) => {
		post.mockResolvedValue(result as never);

		await expect(matchJqls(issues, jqls)).rejects.toThrow(
			"Failed to match JQL",
		);
	});

	test("rejects per-JQL errors even when the HTTP request succeeded", async () => {
		post.mockResolvedValue({
			response: { ok: true },
			data: {
				matches: [
					{ matchedIssues: [101], errors: [] },
					{ matchedIssues: [], errors: ["Invalid JQL"] },
				],
			},
		} as never);

		await expect(matchJqls(issues, jqls)).rejects.toThrow(
			"Internal error when matching JQL",
		);
	});
});
