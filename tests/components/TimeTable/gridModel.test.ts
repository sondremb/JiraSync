import { describe, expect, test } from "vitest";
import { IsoDate } from "../../../src/date-time/IsoWeek";
import { DayReport, type InternalTimecodeId, type JiraIssueId } from "../../../src/reconciliation/entities";
import { toGridEntries } from "../../../src/components/TimeTable/gridModel";

const monday = IsoDate.parse("2025-02-03");
const tuesday = IsoDate.parse("2025-02-04");
const managed = 201 as InternalTimecodeId;
const unmanaged = 202 as InternalTimecodeId;
const issue = 101 as JiraIssueId;

describe("toGridEntries", () => {
	test("groups comparisons across days without losing their Jira totals", () => {
		const first = DayReport.empty(monday);
		first.comparisons.set(managed, {
			timecodeId: managed,
			internalHoursWorked: 3,
			matchedWork: [
				{ issueId: issue, date: monday, hoursWorked: 1 },
				{ issueId: issue, date: monday, hoursWorked: 2 },
			],
		});
		const second = DayReport.empty(tuesday);
		second.comparisons.set(managed, {
			timecodeId: managed,
			internalHoursWorked: 2,
			matchedWork: [],
		});

		expect(toGridEntries([first, second])).toEqual([{
			id: managed,
			managed: true,
			days: {
				[monday]: { bekkHours: 3, totalJiraHours: 3 },
				[tuesday]: { bekkHours: 2, totalJiraHours: 0 },
			},
		}]);
	});

	test("sums unmanaged entries and leaves their Jira hours at zero", () => {
		const report = DayReport.empty(monday);
		report.unmanagedInternals.push(
			{ timecodeId: unmanaged, date: monday, hoursWorked: 1 },
			{ timecodeId: unmanaged, date: monday, hoursWorked: 2 },
		);
		expect(toGridEntries([report])).toEqual([{
			id: unmanaged,
			managed: false,
			days: { [monday]: { bekkHours: 3, totalJiraHours: 0 } },
		}]);
	});

	test("empty days and unmatched Jira work do not create misleading grid rows", () => {
		const report = DayReport.empty(monday);
		report.unmatchedJiraWork.push({ issueId: issue, date: monday, hoursWorked: 2 });
		expect(toGridEntries([report, DayReport.empty(tuesday)])).toEqual([]);
	});

	test("rejects a timecode classified as both managed and unmanaged", () => {
		const first = DayReport.empty(monday);
		first.comparisons.set(managed, {
			timecodeId: managed,
			internalHoursWorked: 1,
			matchedWork: [],
		});
		const second = DayReport.empty(tuesday);
		second.unmanagedInternals.push({ timecodeId: managed, date: tuesday, hoursWorked: 1 });
		expect(() => toGridEntries([first, second])).toThrow("inconsistent management");
	});
});
