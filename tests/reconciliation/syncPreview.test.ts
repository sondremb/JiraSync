import { describe, expect, test } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import {
	DayReport,
	type InternalTimecodeId,
	type JiraIssueId,
} from "../../src/reconciliation/entities";
import {
	groupChangesByDate,
	lockedOutOfSyncDays,
	planSync,
	type ProposedChange,
} from "../../src/reconciliation/syncPreview";

const monday = IsoDate.parse("2025-02-03");
const tuesday = IsoDate.parse("2025-02-04");
const wednesday = IsoDate.parse("2025-02-05");
const firstCode = 201 as InternalTimecodeId;
const secondCode = 202 as InternalTimecodeId;
const issue = 101 as JiraIssueId;

const mismatchOn = (date: IsoDate) => {
	const report = DayReport.empty(date);
	report.comparisons.set(firstCode, {
		timecodeId: firstCode,
		internalHoursWorked: 1,
		matchedWork: [{ issueId: issue, date, hoursWorked: 2 }],
	});
	return report;
};

describe("planSync", () => {
	test("proposes only managed mismatches, including zero-hour removal and Jira-only work", () => {
		const firstDay = DayReport.empty(monday);
		firstDay.comparisons.set(firstCode, {
			timecodeId: firstCode,
			internalHoursWorked: 5,
			matchedWork: [{ issueId: issue, date: monday, hoursWorked: 2 }],
		});
		firstDay.comparisons.set(secondCode, {
			timecodeId: secondCode,
			internalHoursWorked: 3,
			matchedWork: [],
		});
		firstDay.unmanagedInternals.push({
			timecodeId: 203 as InternalTimecodeId,
			date: monday,
			hoursWorked: 7,
		});
		const nextDay = DayReport.empty(tuesday);
		nextDay.comparisons.set(firstCode, {
			timecodeId: firstCode,
			internalHoursWorked: 0,
			matchedWork: [
				{ issueId: issue, date: tuesday, hoursWorked: 1 },
				{ issueId: issue, date: tuesday, hoursWorked: 2 },
			],
		});
		nextDay.comparisons.set(secondCode, {
			timecodeId: secondCode,
			internalHoursWorked: 1,
			matchedWork: [{ issueId: issue, date: tuesday, hoursWorked: 1 }],
		});
		nextDay.unmatchedJiraWork.push({
			issueId: issue,
			date: tuesday,
			hoursWorked: 4,
		});

		expect(planSync([firstDay, nextDay], IsoDate.parse("2025-02-02"))).toEqual([
			{ date: monday, timecodeId: firstCode, currentHours: 5, targetHours: 2 },
			{ date: monday, timecodeId: secondCode, currentHours: 3, targetHours: 0 },
			{ date: tuesday, timecodeId: firstCode, currentHours: 0, targetHours: 3 },
		]);
	});

	test("produces no writes for an empty or in-sync week", () => {
		const unmatchedOnly = DayReport.empty(monday);
		unmatchedOnly.unmatchedJiraWork.push({
			issueId: issue,
			date: monday,
			hoursWorked: 2,
		});
		expect(planSync([unmatchedOnly], IsoDate.parse("2025-02-02"))).toEqual([]);
	});

	test("proposes no change on the lock date", () => {
		expect(planSync([mismatchOn(tuesday)], tuesday)).toEqual([]);
	});

	test("proposes no change before the lock date", () => {
		expect(planSync([mismatchOn(monday)], tuesday)).toEqual([]);
	});

	test("proposes a change after the lock date", () => {
		expect(planSync([mismatchOn(wednesday)], tuesday)).toEqual([
			{
				date: wednesday,
				timecodeId: firstCode,
				currentHours: 1,
				targetHours: 2,
			},
		]);
	});

	test("proposes nothing while the lock date is unknown", () => {
		expect(planSync([mismatchOn(wednesday)], undefined)).toEqual([]);
	});
});

describe("lockedOutOfSyncDays", () => {
	test("lists locked days whose managed hours differ from Jira", () => {
		const inSync = DayReport.empty(monday);
		expect(
			lockedOutOfSyncDays(
				[inSync, mismatchOn(tuesday), mismatchOn(wednesday)],
				tuesday,
			),
		).toEqual([tuesday]);
	});

	test("treats every day as locked while the lock date is unknown", () => {
		expect(
			lockedOutOfSyncDays(
				[mismatchOn(monday), mismatchOn(wednesday)],
				undefined,
			),
		).toEqual([monday, wednesday]);
	});
});

describe("groupChangesByDate", () => {
	const change = (date: IsoDate, timecodeId: number): ProposedChange => ({
		date,
		timecodeId: timecodeId as InternalTimecodeId,
		currentHours: 0,
		targetHours: 1,
	});

	test("groups by day in order of first appearance", () => {
		const a = change(tuesday, 1);
		const b = change(monday, 2);
		const c = change(tuesday, 3);
		expect(groupChangesByDate([a, b, c])).toEqual([
			[tuesday, [a, c]],
			[monday, [b]],
		]);
	});

	test("no changes, no groups", () => {
		expect(groupChangesByDate([])).toEqual([]);
	});
});
