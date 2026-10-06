import { describe, expect, test } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import { DayReport, type InternalTimecodeId, type JiraIssueId } from "../../src/reconciliation/entities";
import { planSync } from "../../src/reconciliation/syncPreview";

const monday = IsoDate.parse("2025-02-03");
const tuesday = IsoDate.parse("2025-02-04");
const firstCode = 201 as InternalTimecodeId;
const secondCode = 202 as InternalTimecodeId;
const issue = 101 as JiraIssueId;

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
		firstDay.unmanagedInternals.push({ timecodeId: 203 as InternalTimecodeId, date: monday, hoursWorked: 7 });
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
		nextDay.unmatchedJiraWork.push({ issueId: issue, date: tuesday, hoursWorked: 4 });

		expect(planSync([firstDay, nextDay])).toEqual([
			{ date: monday, timecodeId: firstCode, currentHours: 5, targetHours: 2 },
			{ date: monday, timecodeId: secondCode, currentHours: 3, targetHours: 0 },
			{ date: tuesday, timecodeId: firstCode, currentHours: 0, targetHours: 3 },
		]);
	});

	test("produces no writes for an empty or in-sync week", () => {
		const unmatchedOnly = DayReport.empty(monday);
		unmatchedOnly.unmatchedJiraWork.push({ issueId: issue, date: monday, hoursWorked: 2 });
		expect(planSync([unmatchedOnly])).toEqual([]);
	});
});
