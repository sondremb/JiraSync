import { describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import { Policy } from "../../src/reconciliation/contracts";
import {
	DayReport,
	InternalTimecodeId,
	JiraIssueId,
	JiraWork,
} from "../../src/reconciliation/entities";
import { reconcilePeriod } from "../../src/reconciliation/reconcile";

const date = IsoDate.parse("2025-02-03");
const issue = 101 as JiraIssueId;
const otherIssue = 102 as JiraIssueId;
const timecode = 201 as InternalTimecodeId;
const worklogs: JiraWork[] = [
	{ issueId: issue, date, hoursWorked: 1 },
	{ issueId: issue, date, hoursWorked: 2 },
	{ issueId: otherIssue, date, hoursWorked: 2 },
];

const selectOnly =
	(...managed: InternalTimecodeId[]): Policy["selectManaged"] =>
	async (ids) =>
		new Set(ids.filter((id) => managed.includes(id)));

describe("reconcilePeriod", () => {
	test("batch-matches distinct issues once and applies the outcomes to every worklog", async () => {
		const matchIssues = vi.fn<Policy["matchIssues"]>().mockResolvedValue(
			new Map([
				[issue, { isMatched: true, timecodeId: timecode }],
				[otherIssue, { isMatched: true, timecodeId: timecode }],
			]),
		);
		const policy: Policy = {
			matchIssues,
			selectManaged: selectOnly(timecode),
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

	test("asks the policy about the distinct union of worked and matched timecodes", async () => {
		const workedTimecode = 202 as InternalTimecodeId;
		const selectManaged = vi
			.fn<Policy["selectManaged"]>()
			.mockResolvedValue(new Set([timecode, workedTimecode]));
		const policy: Policy = {
			matchIssues: async () =>
				new Map([
					[issue, { isMatched: true, timecodeId: timecode }],
					[otherIssue, { isMatched: true, timecodeId: timecode }],
				]),
			selectManaged,
		};

		await reconcilePeriod(
			date,
			date,
			async () => worklogs,
			async () => policy,
			async () => [
				{ timecodeId: workedTimecode, date, hoursWorked: 1 },
				{ timecodeId: workedTimecode, date, hoursWorked: 2 },
			],
		);

		expect(selectManaged).toHaveBeenCalledExactlyOnceWith([
			workedTimecode,
			timecode,
		]);
	});

	test("rejects a match to a timecode the policy does not manage", async () => {
		const policy: Policy = {
			matchIssues: async () =>
				new Map([[issue, { isMatched: true, timecodeId: timecode }]]),
			selectManaged: selectOnly(),
		};

		await expect(
			reconcilePeriod(
				date,
				date,
				async () => [worklogs[0]],
				async () => policy,
				async () => [],
			),
		).rejects.toThrow("does not manage");
	});

	test("propagates a failing selectManaged", async () => {
		const failure = new Error("select failed");
		const policy: Policy = {
			matchIssues: async () =>
				new Map([[issue, { isMatched: true, timecodeId: timecode }]]),
			selectManaged: async () => {
				throw failure;
			},
		};

		await expect(
			reconcilePeriod(
				date,
				date,
				async () => [worklogs[0]],
				async () => policy,
				async () => [],
			),
		).rejects.toBe(failure);
	});

	test("rejects a missing issue outcome instead of returning a partial report", async () => {
		const policy: Policy = {
			matchIssues: async () =>
				new Map([[issue, { isMatched: true, timecodeId: timecode }]]),
			selectManaged: selectOnly(timecode),
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
					return new Map([[issue, { isMatched: true, timecodeId: timecode }]]);
				},
				selectManaged: selectOnly(timecode),
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
