import { describe, expect, test } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import {
	DayReport,
	BekkTimecodeId,
	JiraIssueId,
	JiraWorklog,
	LockDate,
	ManagedTimecodeDayComparison,
} from "../../src/reconciliation/entities";

const date = IsoDate.parse("2025-02-03");
const issue = 101 as JiraIssueId;
const timecode = 201 as BekkTimecodeId;
const otherTimecode = 202 as BekkTimecodeId;

function work(hoursWorked: number): JiraWorklog {
	return { issueId: issue, date, hoursWorked };
}

describe("ManagedTimecodeDayComparison", () => {
	test("compares Bekk hours against the sum of all mapped Jira worklogs", () => {
		const comparison = {
			timecodeId: timecode,
			bekkHours: 3,
			matchedWorklogs: [work(1), work(2)],
		};

		expect(ManagedTimecodeDayComparison.jiraHoursWorked(comparison)).toBe(3);
		expect(ManagedTimecodeDayComparison.isInSync(comparison)).toBe(true);

		comparison.bekkHours = 2;
		expect(ManagedTimecodeDayComparison.isInSync(comparison)).toBe(false);
	});
});

describe("DayReport.isInSync", () => {
	test("requires every managed timecode to be in sync", () => {
		const report = DayReport.empty(date);
		report.comparisons.set(timecode, {
			timecodeId: timecode,
			bekkHours: 2,
			matchedWorklogs: [work(2)],
		});
		report.comparisons.set(otherTimecode, {
			timecodeId: otherTimecode,
			bekkHours: 1,
			matchedWorklogs: [work(2)],
		});

		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("requires review for unmatched Jira work even without comparisons", () => {
		const report = DayReport.empty(date);
		report.unmatchedJiraWorklogs.push(work(1));

		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("ignores unmanaged Bekk entries when determining sync status", () => {
		const report = DayReport.empty(date);
		report.unmanagedEntries.push({
			timecodeId: otherTimecode,
			date,
			hoursWorked: 4,
		});

		expect(DayReport.isInSync(report)).toBe(true);
	});
});

describe("LockDate.isLocked", () => {
	const sunday = IsoDate.parse("2025-02-02");
	const monday = IsoDate.parse("2025-02-03");

	test("locks days on or before the lock date", () => {
		expect(LockDate.isLocked(LockDate.of(sunday), sunday)).toBe(true);
		expect(LockDate.isLocked(LockDate.of(sunday), monday)).toBe(false);
	});

	test("locks no day when nothing is locked yet", () => {
		expect(LockDate.isLocked(LockDate.none, sunday)).toBe(false);
	});

	test("locks every day while the lock date is unknown", () => {
		expect(LockDate.isLocked(LockDate.unknown, monday)).toBe(true);
	});
});
