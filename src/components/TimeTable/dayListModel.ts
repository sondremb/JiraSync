import { IsoDate } from "../../date-time/IsoWeek";
import {
	DayReport,
	type InternalTimecodeId,
} from "../../reconciliation/entities";
import { toGridEntries, type GridEntry } from "./gridModel";

/** One timecode on one day. */
export interface DayListLine {
	id: InternalTimecodeId;
	managed: boolean;
	bekkHours: number;
	/** Omitted for unmanaged timecodes, as on desktop. */
	jiraHours?: number;
	mismatch: boolean;
}

export interface DayListDay {
	kind: "day";
	date: IsoDate;
	/** Bekk hours on all timecodes that day. */
	bekkHours: number;
	inSync: boolean;
	/** Managed timecodes first. Empty when the day has no hours. */
	lines: DayListLine[];
}

/** Saturday and Sunday without any hours, shown as one row. */
export interface DayListWeekend {
	kind: "weekend";
	saturday: IsoDate;
	/** Locking through Sunday is the common end-of-week action, so keep it. */
	sunday: IsoDate;
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

const toLine = (entry: GridEntry, date: IsoDate): DayListLine | undefined => {
	const hours = entry.days[date];
	if (!hours || (hours.bekkHours === 0 && hours.totalJiraHours === 0)) {
		return undefined;
	}
	return {
		id: entry.id,
		managed: entry.managed,
		bekkHours: hours.bekkHours,
		jiraHours: entry.managed ? hours.totalJiraHours : undefined,
		mismatch: entry.managed && hours.bekkHours !== hours.totalJiraHours,
	};
};

const toDay = (report: DayReport, entries: GridEntry[]): DayListDay => {
	const lines = entries
		.map((entry) => toLine(entry, report.date))
		.filter((line) => line !== undefined);
	return {
		kind: "day",
		date: report.date,
		bekkHours: sum(lines.map((line) => line.bekkHours)),
		inSync: DayReport.isInSync(report),
		lines,
	};
};

/** Unmatched Jira worklogs count as hours, so a weekend with them still shows. */
const isEmpty = (day: DayListDay, report: DayReport) =>
	day.lines.length === 0 && report.unmatchedJiraWork.length === 0;

/** The mobile view of a week: one block per day, empty weekends collapsed. */
export function toDayList(reports: readonly DayReport[]): DayList {
	const entries = toGridEntries(reports).sort(
		(a, b) => Number(b.managed) - Number(a.managed),
	);
	const days = reports.map((report) => toDay(report, entries));

	const items: DayListItem[] = [];
	for (let i = 0; i < days.length; i++) {
		const day = days[i];
		const next = days[i + 1];
		if (
			next &&
			IsoDate.weekday(day.date) === SATURDAY &&
			IsoDate.weekday(next.date) === SUNDAY &&
			isEmpty(day, reports[i]) &&
			isEmpty(next, reports[i + 1])
		) {
			items.push({ kind: "weekend", saturday: day.date, sunday: next.date });
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
