import { describe, expect, test } from "vitest";
import { IsoDate, IsoWeek } from "../../../src/date-time/IsoWeek";
import {
	DayReport,
	type InternalTimecodeId,
	type JiraIssueId,
} from "../../../src/reconciliation/entities";
import {
	toDayList,
	type DayListDay,
} from "../../../src/components/TimeTable/dayListModel";

// 2025-02-03 is a Monday.
const week = IsoWeek.fromDate(IsoDate.toDate(IsoDate.parse("2025-02-03")));
const days = IsoWeek.days(week);
const [monday, tuesday, , , , saturday, sunday] = days;
const beforeWeek = IsoDate.parse("2025-01-31");
const issue = 101 as JiraIssueId;
const timecode = (id: number) => id as InternalTimecodeId;

const emptyWeek = () => days.map((date) => DayReport.empty(date));

const reportOn = (reports: DayReport[], date: IsoDate) => {
	const report = reports.find((r) => r.date === date);
	if (!report) throw new Error(`No report for ${date}`);
	return report;
};

const addManaged = (
	report: DayReport,
	id: number,
	bekkHours: number,
	jiraHours: number,
) => {
	report.comparisons.set(timecode(id), {
		timecodeId: timecode(id),
		internalHoursWorked: bekkHours,
		matchedWork: jiraHours
			? [{ issueId: issue, date: report.date, hoursWorked: jiraHours }]
			: [],
	});
};

const addUnmanaged = (report: DayReport, id: number, hours: number) => {
	report.unmanagedInternals.push({
		timecodeId: timecode(id),
		date: report.date,
		hoursWorked: hours,
	});
};

const dayAt = (list: ReturnType<typeof toDayList>, date: IsoDate) => {
	const item = list.items.find(
		(item): item is DayListDay => item.kind === "day" && item.date === date,
	);
	if (!item) throw new Error(`No day for ${date}`);
	return item;
};

describe("toDayList", () => {
	describe("weekend collapse", () => {
		test("an empty weekend becomes one row that keeps the Sunday lock", () => {
			const list = toDayList(emptyWeek(), beforeWeek);
			expect(list.items).toHaveLength(6);
			expect(list.items.at(-1)).toEqual({ kind: "weekend", saturday, sunday });
		});

		test("Bekk hours on Saturday keep both days", () => {
			const reports = emptyWeek();
			addUnmanaged(reportOn(reports, saturday), 202, 2);
			const list = toDayList(reports, beforeWeek);
			expect(list.items.map((item) => item.kind)).toEqual(Array(7).fill("day"));
		});

		test("Bekk hours on Sunday keep both days", () => {
			const reports = emptyWeek();
			addManaged(reportOn(reports, sunday), 201, 1, 1);
			expect(toDayList(reports, beforeWeek).items).toHaveLength(7);
		});

		test("matched Jira-only hours keep both days", () => {
			const reports = emptyWeek();
			addManaged(reportOn(reports, sunday), 201, 0, 3);
			expect(toDayList(reports, beforeWeek).items).toHaveLength(7);
		});

		test("unmatched Jira worklogs keep both days", () => {
			const reports = emptyWeek();
			reportOn(reports, saturday).unmatchedJiraWork.push({
				issueId: issue,
				date: saturday,
				hoursWorked: 1,
			});
			expect(toDayList(reports, beforeWeek).items).toHaveLength(7);
		});

		test("an empty Saturday and Sunday that are not a weekend pair stay apart", () => {
			const list = toDayList(
				[DayReport.empty(saturday), DayReport.empty(monday)],
				beforeWeek,
			);
			expect(list.items.map((item) => item.kind)).toEqual(["day", "day"]);
		});
	});

	test("day and week totals sum Bekk hours across timecodes", () => {
		const reports = emptyWeek();
		addManaged(reportOn(reports, monday), 201, 6, 6);
		addUnmanaged(reportOn(reports, monday), 202, 1.5);
		addManaged(reportOn(reports, tuesday), 201, 4, 7.5);
		const list = toDayList(reports, beforeWeek);
		expect(dayAt(list, monday).bekkHours).toBe(7.5);
		expect(dayAt(list, tuesday).bekkHours).toBe(4);
		expect(list.weekBekkHours).toBe(11.5);
	});

	test("days up to the lock date are locked", () => {
		const reports = emptyWeek();
		const list = toDayList(reports, monday);
		expect(dayAt(list, monday).locked).toBe(true);
		expect(dayAt(list, tuesday).locked).toBe(false);
	});

	test("a day with only unmatched Jira worklogs has no lines", () => {
		const reports = emptyWeek();
		reportOn(reports, monday).unmatchedJiraWork.push({
			issueId: issue,
			date: monday,
			hoursWorked: 2,
		});
		const day = dayAt(toDayList(reports, beforeWeek), monday);
		expect(day.lines).toEqual([]);
	});

	test("one managed timecode gives one line with Jira hours and mismatch", () => {
		const reports = emptyWeek();
		addManaged(reportOn(reports, monday), 201, 5, 7.5);
		expect(dayAt(toDayList(reports, beforeWeek), monday).lines).toEqual([
			{
				id: timecode(201),
				managed: true,
				bekkHours: 5,
				jiraHours: 7.5,
				state: "willChange",
			},
		]);
	});

	test("six timecodes: managed before unmanaged, unmanaged without Jira hours", () => {
		const reports = emptyWeek();
		const report = reportOn(reports, monday);
		addUnmanaged(report, 301, 1);
		addManaged(report, 201, 1, 1);
		addUnmanaged(report, 302, 1);
		addManaged(report, 202, 1, 2);
		addUnmanaged(report, 303, 0.5);
		addManaged(report, 203, 2, 2);
		const day = dayAt(toDayList(reports, beforeWeek), monday);
		expect(day.lines.map((line) => [line.id, line.managed])).toEqual([
			[201, true],
			[202, true],
			[203, true],
			[301, false],
			[302, false],
			[303, false],
		]);
		for (const line of day.lines.filter((line) => !line.managed)) {
			expect(line.jiraHours).toBeUndefined();
			expect(line.state).toBe("unmanaged");
		}
		expect(day.bekkHours).toBe(6.5);
	});

	test("a differing line on a locked day is locked, not changing", () => {
		const reports = emptyWeek();
		addManaged(reportOn(reports, monday), 201, 5, 7.5);
		const [line] = dayAt(toDayList(reports, monday), monday).lines;
		expect(line.state).toBe("lockedDiffers");
	});

	test("a timecode only appears on days it has hours", () => {
		const reports = emptyWeek();
		addManaged(reportOn(reports, monday), 201, 7.5, 7.5);
		const list = toDayList(reports, beforeWeek);
		expect(dayAt(list, monday).lines).toHaveLength(1);
		expect(dayAt(list, tuesday).lines).toEqual([]);
	});
});
