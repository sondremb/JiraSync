import { describe, expect, test } from "vitest";
import { IsoDate } from "../date-time/IsoWeek";
import {
	DayReport,
	InternalTimecodeId,
	JiraIssueId,
	JiraWork,
	ManagedTimecodeDayComparison,
	JiraMatchResult,
} from "./entities";
import { reconcileInternal } from "./reconcile";

const monday = IsoDate.parse("2025-02-03");
const tuesday = IsoDate.parse("2025-02-04");
const wednesday = IsoDate.parse("2025-02-05");
const issue = 101 as JiraIssueId;
const otherIssue = 102 as JiraIssueId;
const timecode = 201 as InternalTimecodeId;
const otherTimecode = 202 as InternalTimecodeId;

function mapped(...ids: JiraIssueId[]): JiraMatchResult {
	return new Map(
		ids.map((issueId) => [
			issueId,
			{ isMatched: true, timecodeId: timecode },
		]),
	);
}

function jira(
	issueId: JiraIssueId,
	date: IsoDate,
	hoursWorked: number,
): JiraWork {
	return { issueId, date, hoursWorked };
}

describe("reconcileInternal", () => {
	test("returns an in-sync report for each day of an empty period", () => {
		const reports = reconcileInternal(
			monday,
			wednesday,
			[],
			[],
			new Map(),
			new Set([timecode]),
		);

		expect(reports.map((report) => report.date)).toEqual([
			monday,
			tuesday,
			wednesday,
		]);
		for (const report of reports) {
			expect(report.comparisons.size).toBe(0);
			expect(DayReport.isInSync(report)).toBe(true);
		}
	});

	test("sums multiple worklogs per issue and multiple issues per managed timecode", () => {
		const worklogs = [
			jira(issue, monday, 1),
			jira(issue, monday, 2),
			jira(otherIssue, monday, 2),
		];
		const [report] = reconcileInternal(
			monday,
			monday,
			[{ timecodeId: timecode, date: monday, hoursWorked: 5 }],
			worklogs,
			mapped(issue, otherIssue),
			new Set([timecode]),
		);
		const comparison = report.comparisons.get(timecode);

		expect(report.comparisons.size).toBe(1);
		expect(comparison?.matchedWork).toEqual(worklogs);
		expect(
			comparison && ManagedTimecodeDayComparison.jiraHoursWorked(comparison),
		).toBe(5);
		expect(DayReport.isInSync(report)).toBe(true);
	});

	test("adds repeated Internal entries for the same day and timecode", () => {
		const [report] = reconcileInternal(
			monday,
			monday,
			[
				{ timecodeId: timecode, date: monday, hoursWorked: 2 },
				{ timecodeId: timecode, date: monday, hoursWorked: 3 },
			],
			[jira(issue, monday, 5)],
			mapped(issue),
			new Set([timecode]),
		);

		expect(report.comparisons.get(timecode)?.internalHoursWorked).toBe(5);
		expect(DayReport.isInSync(report)).toBe(true);
	});

	test("treats absent hours on either side as zero", () => {
		const [report] = reconcileInternal(
			monday,
			monday,
			[{ timecodeId: otherTimecode, date: monday, hoursWorked: 3 }],
			[jira(issue, monday, 2)],
			mapped(issue),
			new Set([timecode, otherTimecode]),
		);

		expect(report.comparisons.get(timecode)?.internalHoursWorked).toBe(0);
		expect(report.comparisons.get(otherTimecode)?.matchedWork).toEqual([]);
		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("flags unmatched Jira work even when managed hours agree", () => {
		const unmatched = jira(otherIssue, monday, 1);
		const matches = mapped(issue);
		matches.set(otherIssue, { isMatched: false });
		const [report] = reconcileInternal(
			monday,
			monday,
			[{ timecodeId: timecode, date: monday, hoursWorked: 2 }],
			[jira(issue, monday, 2), unmatched],
			matches,
			new Set([timecode]),
		);

		expect(report.unmatchedJiraWork).toEqual([unmatched]);
		expect(
			ManagedTimecodeDayComparison.isInSync(report.comparisons.get(timecode)!),
		).toBe(true);
		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("shows unmanaged Internal entries without affecting sync status", () => {
		const unmanaged = {
			timecodeId: otherTimecode,
			date: monday,
			hoursWorked: 4,
		};
		const [report] = reconcileInternal(
			monday,
			monday,
			[{ timecodeId: timecode, date: monday, hoursWorked: 2 }, unmanaged],
			[jira(issue, monday, 2)],
			mapped(issue),
			new Set([timecode]),
		);

		expect(report.unmanagedInternals).toEqual([unmanaged]);
		expect(report.comparisons.has(otherTimecode)).toBe(false);
		expect(DayReport.isInSync(report)).toBe(true);
	});

	test("keeps daily comparisons separate across an empty day", () => {
		const reports = reconcileInternal(
			monday,
			wednesday,
			[
				{ timecodeId: timecode, date: monday, hoursWorked: 2 },
				{ timecodeId: timecode, date: wednesday, hoursWorked: 1 },
			],
			[jira(issue, monday, 2), jira(issue, wednesday, 3)],
			mapped(issue),
			new Set([timecode]),
		);

		expect(reports.map((report) => report.date)).toEqual([
			monday,
			tuesday,
			wednesday,
		]);
		expect(reports.map((report) => DayReport.isInSync(report))).toEqual([
			true,
			true,
			false,
		]);
		expect(reports[1].comparisons.size).toBe(0);
		expect(reports[2].comparisons.get(timecode)?.internalHoursWorked).toBe(1);
	});
});
