import { describe, expect, test } from "vitest";
import { IsoDate } from "../../../src/date-time/IsoWeek";
import {
	DayReport,
	type BekkTimecodeId,
	type JiraIssueId,
} from "../../../src/reconciliation/entities";
import {
	cellState,
	toGridEntries,
} from "../../../src/components/TimeTable/gridModel";

const monday = IsoDate.parse("2025-02-03");
const tuesday = IsoDate.parse("2025-02-04");
const managed = 201 as BekkTimecodeId;
const unmanaged = 202 as BekkTimecodeId;
const issue = 101 as JiraIssueId;

describe("toGridEntries", () => {
	test("groups comparisons across days without losing their Jira totals", () => {
		const first = DayReport.empty(monday);
		first.comparisons.set(managed, {
			timecodeId: managed,
			bekkHours: 3,
			matchedWorklogs: [
				{ issueId: issue, date: monday, hoursWorked: 1 },
				{ issueId: issue, date: monday, hoursWorked: 2 },
			],
		});
		const second = DayReport.empty(tuesday);
		second.comparisons.set(managed, {
			timecodeId: managed,
			bekkHours: 2,
			matchedWorklogs: [],
		});

		expect(toGridEntries([first, second])).toEqual([
			{
				id: managed,
				managed: true,
				days: {
					[monday]: { bekkHours: 3, totalJiraHours: 3 },
					[tuesday]: { bekkHours: 2, totalJiraHours: 0 },
				},
			},
		]);
	});

	test("sums unmanaged entries and leaves their Jira hours at zero", () => {
		const report = DayReport.empty(monday);
		report.unmanagedEntries.push(
			{ timecodeId: unmanaged, date: monday, hoursWorked: 1 },
			{ timecodeId: unmanaged, date: monday, hoursWorked: 2 },
		);
		expect(toGridEntries([report])).toEqual([
			{
				id: unmanaged,
				managed: false,
				days: { [monday]: { bekkHours: 3, totalJiraHours: 0 } },
			},
		]);
	});

	test("empty days and unmatched Jira work do not create misleading grid rows", () => {
		const report = DayReport.empty(monday);
		report.unmatchedJiraWorklogs.push({
			issueId: issue,
			date: monday,
			hoursWorked: 2,
		});
		expect(toGridEntries([report, DayReport.empty(tuesday)])).toEqual([]);
	});

	test("rejects a timecode classified as both managed and unmanaged", () => {
		const first = DayReport.empty(monday);
		first.comparisons.set(managed, {
			timecodeId: managed,
			bekkHours: 1,
			matchedWorklogs: [],
		});
		const second = DayReport.empty(tuesday);
		second.unmanagedEntries.push({
			timecodeId: managed,
			date: tuesday,
			hoursWorked: 1,
		});
		expect(() => toGridEntries([first, second])).toThrow(
			"inconsistent management",
		);
	});
});

describe("cellState", () => {
	const day = (bekkHours: number, totalJiraHours: number) => ({
		bekkHours,
		totalJiraHours,
	});

	test("no hours in either system is empty, managed or not, locked or not", () => {
		expect(cellState(undefined, true, false)).toBe("empty");
		expect(cellState(day(0, 0), true, true)).toBe("empty");
		expect(cellState(day(0, 0), false, false)).toBe("empty");
	});

	test("unmanaged hours are never compared with Jira", () => {
		expect(cellState(day(2.5, 0), false, false)).toBe("unmanaged");
		expect(cellState(day(2.5, 0), false, true)).toBe("unmanaged");
	});

	test("matching hours are in sync, locked or not", () => {
		expect(cellState(day(7.5, 7.5), true, false)).toBe("inSync");
		expect(cellState(day(7.5, 7.5), true, true)).toBe("inSync");
	});

	test("differing hours change, unless the day is locked", () => {
		expect(cellState(day(0, 5), true, false)).toBe("willChange");
		expect(cellState(day(2, 0), true, false)).toBe("willChange");
		expect(cellState(day(0, 5), true, true)).toBe("lockedDiffers");
	});
});
