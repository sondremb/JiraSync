import { describe, expect, test } from "vitest";
import { IsoDate } from "../date-time/IsoWeek";
import {
	DayReport,
	InternalTimecodeId,
	JiraIssueId,
	JiraWork,
	ManagedTimecodeDayComparison,
} from "./entities";

const date = IsoDate.parse("2025-02-03");
const issue = 101 as JiraIssueId;
const timecode = 201 as InternalTimecodeId;
const otherTimecode = 202 as InternalTimecodeId;

function work(hoursWorked: number): JiraWork {
	return { issueId: issue, date, hoursWorked };
}

describe("ManagedTimecodeDayComparison", () => {
	test("compares Internal hours against the sum of all mapped Jira worklogs", () => {
		const comparison = {
			timecodeId: timecode,
			internalHoursWorked: 3,
			matchedWork: [work(1), work(2)],
		};

		expect(ManagedTimecodeDayComparison.jiraHoursWorked(comparison)).toBe(3);
		expect(ManagedTimecodeDayComparison.isInSync(comparison)).toBe(true);

		comparison.internalHoursWorked = 2;
		expect(ManagedTimecodeDayComparison.isInSync(comparison)).toBe(false);
	});
});

describe("DayReport.isInSync", () => {
	test("requires every managed timecode to be in sync", () => {
		const report = DayReport.empty(date);
		report.comparisons.set(timecode, {
			timecodeId: timecode,
			internalHoursWorked: 2,
			matchedWork: [work(2)],
		});
		report.comparisons.set(otherTimecode, {
			timecodeId: otherTimecode,
			internalHoursWorked: 1,
			matchedWork: [work(2)],
		});

		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("requires review for unmatched Jira work even without comparisons", () => {
		const report = DayReport.empty(date);
		report.unmatchedJiraWork.push(work(1));

		expect(DayReport.isInSync(report)).toBe(false);
	});

	test("ignores unmanaged Internal entries when determining sync status", () => {
		const report = DayReport.empty(date);
		report.unmanagedInternals.push({
			timecodeId: otherTimecode,
			date,
			hoursWorked: 4,
		});

		expect(DayReport.isInSync(report)).toBe(true);
	});
});
