import { describe, expect, test, vi } from "vitest";
import { JiraProjectKey } from "../../data/issue";
import { Jql, Ruleset, RulesetId } from "../../rules";
import { InternalTimecodeId, JiraIssueId } from "../entities";
import { createJqlPolicy } from "./jqlPolicy";

const firstIssue = 101 as JiraIssueId;
const secondIssue = 102 as JiraIssueId;
const unexpectedIssue = 103 as JiraIssueId;
const firstTimecode = 201 as InternalTimecodeId;
const secondTimecode = 202 as InternalTimecodeId;

const ruleset: Ruleset = {
	id: "test-policy" as RulesetId,
	name: "Test policy",
	rules: [
		{
			projectKey: "DEV" as JiraProjectKey,
			jql: "component = A" as Jql,
			timecode: firstTimecode,
		},
		{ projectKey: "DEV" as JiraProjectKey, timecode: secondTimecode },
	],
};

type MatchJqls = Parameters<typeof createJqlPolicy>[1];

describe("createJqlPolicy", () => {
	test("does not request JQL matches for an empty week", async () => {
		const matchJqls = vi.fn<MatchJqls>();
		const policy = createJqlPolicy(ruleset, matchJqls);

		expect(await policy.matchIssues([])).toEqual(new Map());
		expect(matchJqls).not.toHaveBeenCalled();
	});
	test("treats all issues as unmatched if the selected policy has no rules", async () => {
		const matchJqls = vi.fn<MatchJqls>();
		const policy = createJqlPolicy({ ...ruleset, rules: [] }, matchJqls);

		expect(await policy.matchIssues([firstIssue])).toEqual(new Map([
			[firstIssue, { isMatched: false }],
		]));
		expect(await policy.getManagedTimecodes()).toEqual(new Set());
		expect(matchJqls).not.toHaveBeenCalled();
	});
	test("batch-matches with full JQL in rule order and gives the first matching rule priority", async () => {
		const matchJqls = vi
			.fn<MatchJqls>()
			.mockResolvedValue([
				{ matchedIssues: [firstIssue] },
				{ matchedIssues: [firstIssue, secondIssue] },
			]);
		const policy = createJqlPolicy(ruleset, matchJqls);

		const results = await policy.matchIssues([firstIssue, secondIssue]);

		expect(matchJqls).toHaveBeenCalledExactlyOnceWith(
			[firstIssue, secondIssue],
			["project = 'DEV' AND (component = A)", "project = 'DEV'"],
		);
		expect(results).toEqual(
			new Map([
				[firstIssue, { isMatched: true, timecodeId: firstTimecode }],
				[secondIssue, { isMatched: true, timecodeId: secondTimecode }],
			]),
		);
	});

	test("returns an explicit unmatched outcome for each issue without a rule match", async () => {
		const matchJqls = vi
			.fn<MatchJqls>()
			.mockResolvedValue([
				{ matchedIssues: [firstIssue] },
				{ matchedIssues: [] },
			]);
		const policy = createJqlPolicy(ruleset, matchJqls);

		expect(await policy.matchIssues([firstIssue, secondIssue])).toEqual(
			new Map([
				[firstIssue, { isMatched: true, timecodeId: firstTimecode }],
				[secondIssue, { isMatched: false }],
			]),
		);
	});

	test("derives distinct managed timecodes from every rule, even when no issues match", async () => {
		const policy = createJqlPolicy(
			{
				...ruleset,
				rules: [
					...ruleset.rules,
					{ projectKey: "OTHER" as JiraProjectKey, timecode: firstTimecode },
				],
			},
			vi.fn<MatchJqls>(),
		);

		expect(await policy.getManagedTimecodes()).toEqual(
			new Set([firstTimecode, secondTimecode]),
		);
	});

	test("rejects a result for the wrong number of JQLs", async () => {
		const policy = createJqlPolicy(
			ruleset,
			vi.fn<MatchJqls>().mockResolvedValue([{ matchedIssues: [firstIssue] }]),
		);

		await expect(policy.matchIssues([firstIssue])).rejects.toThrow(
			"Match length does not match rules length",
		);
	});

	test("rejects an issue ID not in the requested batch", async () => {
		const policy = createJqlPolicy(
			ruleset,
			vi
				.fn<MatchJqls>()
				.mockResolvedValue([
					{ matchedIssues: [unexpectedIssue] },
					{ matchedIssues: [] },
				]),
		);

		await expect(policy.matchIssues([firstIssue])).rejects.toThrow(
			"Unexpected issue id from JQL match",
		);
	});

	test("propagates a batch matcher failure", async () => {
		const failure = new Error("Jira unavailable");
		const policy = createJqlPolicy(
			ruleset,
			vi.fn<MatchJqls>().mockRejectedValue(failure),
		);

		await expect(policy.matchIssues([firstIssue])).rejects.toBe(failure);
	});
});
