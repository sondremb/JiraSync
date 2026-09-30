import { describe, expect, test, vi } from "vitest";
import { IsoDate } from "../date-time/IsoWeek";
import { Policy } from "./contracts";
import {
	DayReport,
	InternalTimecodeId,
	JiraIssueId,
	JiraWork,
} from "./entities";
import { reconcilePeriod } from "./reconcile";

const date = IsoDate.parse("2025-02-03");
const issue = 101 as JiraIssueId;
const otherIssue = 102 as JiraIssueId;
const timecode = 201 as InternalTimecodeId;
const worklogs: JiraWork[] = [
	{ issueId: issue, date, hoursWorked: 1 },
	{ issueId: issue, date, hoursWorked: 2 },
	{ issueId: otherIssue, date, hoursWorked: 2 },
];

describe("reconcilePeriod", () => {
	test("batch-matches distinct issues once and applies the outcomes to every worklog", async () => {
		const matchIssues = vi.fn<Policy["matchIssues"]>().mockResolvedValue(
			new Map([
				[issue, { isMatched: true, timecodeId: timecode }],
				[
					otherIssue,
					{ isMatched: true, timecodeId: timecode },
				],
			]),
		);
		const policy: Policy = {
			matchIssues,
			getManagedTimecodes: async () => new Set([timecode]),
		};
		const loadJiraWorklogs = vi.fn().mockResolvedValue(worklogs);
		const loadInternalWorklogs = vi
			.fn()
			.mockResolvedValue([{ timecodeId: timecode, date, hoursWorked: 5 }]);

		const [report] = await reconcilePeriod(
			date,
			date,
			loadJiraWorklogs,
			async () => policy,
			loadInternalWorklogs,
		);

		expect(loadJiraWorklogs).toHaveBeenCalledWith(date, date);
		expect(loadInternalWorklogs).toHaveBeenCalledWith(date, date);
		expect(matchIssues).toHaveBeenCalledExactlyOnceWith([issue, otherIssue]);
		expect(report.comparisons.get(timecode)?.matchedWork).toEqual(worklogs);
		expect(DayReport.isInSync(report)).toBe(true);
	});

	test("rejects a missing issue outcome instead of returning a partial report", async () => {
		const policy: Policy = {
			matchIssues: async () =>
				new Map([
					[issue, { isMatched: true, timecodeId: timecode }],
				]),
			getManagedTimecodes: async () => new Set([timecode]),
		};
		const loadInternalWorklogs = vi.fn().mockResolvedValue([]);

		await expect(
			reconcilePeriod(
				date,
				date,
				async () => worklogs,
				async () => policy,
				loadInternalWorklogs,
			),
		).rejects.toThrow("policy did not provide match for all issues");
		expect(loadInternalWorklogs).not.toHaveBeenCalled();
	});

	test.each(["policy", "Jira worklogs", "matcher", "Internal worklogs"])(
		"propagates a failed %s operation instead of returning an in-sync day",
		async (failedOperation) => {
			const failure = new Error(`${failedOperation} failed`);
			const policy: Policy = {
				matchIssues: async () => {
					if (failedOperation === "matcher") throw failure;
					return new Map([
						[issue, { isMatched: true, timecodeId: timecode }],
					]);
				},
				getManagedTimecodes: async () => new Set([timecode]),
			};
			await expect(
				reconcilePeriod(
					date,
					date,
					async () => {
						if (failedOperation === "Jira worklogs") throw failure;
						return [worklogs[0]];
					},
					async () => {
						if (failedOperation === "policy") throw failure;
						return policy;
					},
					async () => {
						if (failedOperation === "Internal worklogs") throw failure;
						return [];
					},
				),
			).rejects.toBe(failure);
		},
	);
});
