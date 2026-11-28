import { IsoDate } from "../../date-time/IsoWeek";
import { LockDate } from "../../reconciliation/entities";
import type {
	DayReport,
	BekkTimecodeId,
	JiraIssueId,
} from "../../reconciliation/entities";
import {
	cellState,
	toGridEntries,
	toUnmatchedRows,
	type CellState,
	type GridEntry,
	type UnmatchedGridRow,
} from "./gridModel";

/** One timecode on one day. */
export interface DayListLine {
	id: BekkTimecodeId;
	managed: boolean;
	bekkHours: number;
	/** Omitted for unmanaged timecodes, as on desktop. */
	jiraHours?: number;
	state: CellState;
}

/** Jira hours on one issue no rule matches, on one day. */
export interface DayListUnmatched {
	issueId: JiraIssueId;
	jiraHours: number;
}

export interface DayListDay {
	kind: "day";
	date: IsoDate;
	/** Bekk hours on all timecodes that day. */
	bekkHours: number;
	/** Locked days get a muted date, as on desktop. */
	locked: boolean;
	/** Whether the day can be a lock date, so it gets a lock button. */
	lockable: boolean;
	/** Managed timecodes first. Empty when the day has no hours. */
	lines: DayListLine[];
	/** Issues no rule matches, shown below the lines, as on desktop. */
	unmatched: DayListUnmatched[];
}

/** Saturday and Sunday without any hours, shown as one row. */
export interface DayListWeekend {
	kind: "weekend";
	saturday: IsoDate;
	/**
	 * The days in the row that can be a lock date: always Sunday, the common
	 * end-of-week lock, and Saturday first when it ends a month.
	 */
	lockableDays: IsoDate[];
}

export type DayListItem = DayListDay | DayListWeekend;

export interface DayList {
	items: DayListItem[];
	/** Bekk hours on all timecodes that week. */
	weekBekkHours: number;
}

const SATURDAY = 6;
const SUNDAY = 7;

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const toLine = (
	entry: GridEntry,
	date: IsoDate,
	locked: boolean,
): DayListLine | undefined => {
	const hours = entry.days[date];
	const state = cellState(hours, entry.managed, locked);
	if (!hours || state === "empty") return undefined;
	return {
		id: entry.id,
		managed: entry.managed,
		bekkHours: hours.bekkHours,
		jiraHours: entry.managed ? hours.totalJiraHours : undefined,
		state,
	};
};

const toDay = (
	report: DayReport,
	entries: GridEntry[],
	unmatchedRows: UnmatchedGridRow[],
	lockDate: LockDate,
): DayListDay => {
	const locked = LockDate.isLocked(lockDate, report.date);
	const lines = entries
		.map((entry) => toLine(entry, report.date, locked))
		.filter((line) => line !== undefined);
	return {
		kind: "day",
		date: report.date,
		bekkHours: sum(lines.map((line) => line.bekkHours)),
		locked,
		lockable: LockDate.canLockThrough(report.date),
		lines,
		unmatched: unmatchedRows.flatMap((row) => {
			const jiraHours = row.days[report.date];
			return jiraHours ? [{ issueId: row.issueId, jiraHours }] : [];
		}),
	};
};

/** Unmatched Jira worklogs count as hours, so a weekend with them still shows. */
const isEmpty = (day: DayListDay) =>
	day.lines.length === 0 && day.unmatched.length === 0;

/** The mobile view of a week: one block per day, empty weekends collapsed. */
export function toDayList(
	reports: readonly DayReport[],
	lockDate: LockDate,
): DayList {
	const entries = toGridEntries(reports).sort(
		(a, b) => Number(b.managed) - Number(a.managed),
	);
	const unmatched = toUnmatchedRows(reports);
	const days = reports.map((report) =>
		toDay(report, entries, unmatched, lockDate),
	);

	const items: DayListItem[] = [];
	for (let i = 0; i < days.length; i++) {
		const day = days[i];
		const next = days[i + 1];
		if (
			next &&
			IsoDate.weekday(day.date) === SATURDAY &&
			IsoDate.weekday(next.date) === SUNDAY &&
			isEmpty(day) &&
			isEmpty(next)
		) {
			items.push({
				kind: "weekend",
				saturday: day.date,
				lockableDays: [day.date, next.date].filter(LockDate.canLockThrough),
			});
			i++;
		} else {
			items.push(day);
		}
	}

	return {
		items,
		weekBekkHours: sum(days.map((day) => day.bekkHours)),
	};
}
