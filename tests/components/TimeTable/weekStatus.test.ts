import { describe, expect, test } from "vitest";
import { IsoDate, IsoWeek } from "../../../src/date-time/IsoWeek";
import {
	DayReport,
	type InternalTimecodeId,
	type JiraIssueId,
} from "../../../src/reconciliation/entities";
import { toWeekStatus } from "../../../src/components/TimeTable/weekStatus";

// 2025-02-03 is a Monday.
const week = IsoWeek.fromDate(IsoDate.toDate(IsoDate.parse("2025-02-03")));
const [monday, tuesday, wednesday, thursday, friday] = IsoWeek.days(week);
const beforeWeek = IsoDate.parse("2025-01-31");
const issue = 101 as JiraIssueId;
const timecode = 201 as InternalTimecodeId;

const managed = (date: IsoDate, bekkHours: number, jiraHours: number) => {
	const report = DayReport.empty(date);
	report.comparisons.set(timecode, {
		timecodeId: timecode,
		internalHoursWorked: bekkHours,
		matchedWork: jiraHours
			? [{ issueId: issue, date, hoursWorked: jiraHours }]
			: [],
	});
	return report;
};

const unmatched = (date: IsoDate) => {
	const report = managed(date, 7.5, 7.5);
	report.unmatchedJiraWork.push({ issueId: issue, date, hoursWorked: 1 });
	return report;
};

describe("toWeekStatus", () => {
	test("gives each day one status and counts them", () => {
		const status = toWeekStatus(
			[
				managed(monday, 7.5, 7.5),
				managed(tuesday, 0, 4),
				unmatched(wednesday),
				DayReport.empty(thursday),
				managed(friday, 2, 0),
			],
			beforeWeek,
		);
		expect(status.days).toEqual({
			[monday]: "inSync",
			[tuesday]: "willChange",
			[wednesday]: "unmatched",
			[thursday]: "empty",
			[friday]: "willChange",
		});
		expect(status).toMatchObject({
			bekkHours: 7.5 + 0 + 7.5 + 2,
			daysToSync: 2,
			daysInSync: 1,
			unmatchedWorklogs: 1,
			lockedDaysDiffering: 0,
		});
	});

	test("a locked day that differs is not synced, but counted", () => {
		const status = toWeekStatus(
			[managed(monday, 0, 4), managed(tuesday, 0, 4)],
			monday,
		);
		expect(status.days).toEqual({
			[monday]: "lockedDiffers",
			[tuesday]: "willChange",
		});
		expect(status.daysToSync).toBe(1);
		expect(status.lockedDaysDiffering).toBe(1);
	});

	test("an unmatched worklog outranks a change on the same day", () => {
		const report = unmatched(monday);
		report.comparisons.set(timecode, {
			timecodeId: timecode,
			internalHoursWorked: 0,
			matchedWork: [{ issueId: issue, date: monday, hoursWorked: 3 }],
		});
		const status = toWeekStatus([report], beforeWeek);
		expect(status.days[monday]).toBe("unmatched");
		expect(status.daysToSync).toBe(1);
	});

	test("week hours include unmanaged Bekk hours but not Jira hours", () => {
		const report = managed(monday, 1, 4);
		report.unmanagedInternals.push({
			timecodeId: 202 as InternalTimecodeId,
			date: monday,
			hoursWorked: 2.5,
		});
		expect(toWeekStatus([report], beforeWeek).bekkHours).toBe(3.5);
	});

	test("a managed timecode with zero hours on both sides is empty", () => {
		const status = toWeekStatus([managed(monday, 0, 0)], beforeWeek);
		expect(status.days[monday]).toBe("empty");
		expect(status.daysInSync).toBe(0);
	});
});
