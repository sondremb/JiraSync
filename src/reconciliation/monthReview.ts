import { IsoDate, IsoMonth, IsoWeek } from "../date-time/IsoWeek";
import { DayReport, LockDate } from "./entities";

/**
 * The billing month to check around a month end, or `null` for none. A month
 * is checked while the lock date is known and either today's week contains its
 * last day, or it has ended without being locked (lock date < last day <
 * today). When both apply to different months, the earlier one is the next to
 * lock.
 */
export function monthToCheck(
	today: IsoDate,
	lockDate: LockDate,
): IsoMonth | null {
	if (lockDate.kind === "unknown") return null;
	const candidates: IsoMonth[] = [];
	const monthEnd = IsoWeek.days(IsoWeek.fromIsoDate(today)).find(
		(day) => IsoMonth.lastDay(IsoMonth.fromIsoDate(day)) === day,
	);
	if (monthEnd) candidates.push(IsoMonth.fromIsoDate(monthEnd));
	if (lockDate.kind === "date") {
		const firstUnlocked = IsoMonth.fromIsoDate(
			IsoDate.addDays(lockDate.date, 1),
		);
		if (IsoMonth.lastDay(firstUnlocked) < today) candidates.push(firstUnlocked);
	}
	return candidates.sort()[0] ?? null;
}

/** A week with at least one day of the month out of sync. */
export interface OutOfSyncWeek {
	week: IsoWeek;
	/** An out-of-sync day is on or before the lock date, so it needs unlocking first. */
	locked: boolean;
	/** The week the employee is looking at. */
	viewed: boolean;
}

/**
 * How a billing month stands, or `null` when there's nothing to say: the
 * month is locked and in sync.
 */
export type MonthStatus =
	| { kind: "inSync"; month: IsoMonth }
	| { kind: "outOfSync"; month: IsoMonth; weeks: OutOfSyncWeek[] };

/** The month's status from day reports covering it; days outside it are ignored. */
export function monthStatus({
	month,
	reports,
	lockDate,
	viewedWeek,
}: {
	month: IsoMonth;
	reports: readonly DayReport[];
	lockDate: LockDate;
	viewedWeek: IsoWeek;
}): MonthStatus | null {
	const first = IsoMonth.firstDay(month);
	const last = IsoMonth.lastDay(month);
	const outOfSync = reports
		.filter((report) => first <= report.date && report.date <= last)
		.filter((report) => !DayReport.isInSync(report))
		.map((report) => report.date)
		.sort();
	if (outOfSync.length === 0) {
		const locked = lockDate.kind === "date" && lockDate.date >= last;
		return locked ? null : { kind: "inSync", month };
	}
	const weeks = new Map<IsoWeek, OutOfSyncWeek>();
	for (const date of outOfSync) {
		const week = IsoWeek.fromIsoDate(date);
		const entry = weeks.get(week) ?? {
			week,
			locked: false,
			viewed: week === viewedWeek,
		};
		entry.locked ||= LockDate.isLocked(lockDate, date);
		weeks.set(week, entry);
	}
	return { kind: "outOfSync", month, weeks: [...weeks.values()] };
}

/** One week's reconciliation as React Query has it. */
export interface WeekResult {
	data?: readonly DayReport[];
	error?: Error | null;
}

/**
 * What to say about the month: its status, an error if any week failed to
 * load, or `null` while anything is loading. Never a status from part of the
 * month (ADR 0004).
 */
export type MonthReview = MonthStatus | { kind: "error"; month: IsoMonth };

export function reviewMonth({
	month,
	weeks,
	lockDate,
	viewedWeek,
}: {
	month: IsoMonth | null;
	weeks: readonly WeekResult[];
	lockDate: LockDate;
	viewedWeek: IsoWeek;
}): MonthReview | null {
	if (month === null) return null;
	if (weeks.some((week) => week.error)) return { kind: "error", month };
	if (weeks.some((week) => !week.data)) return null;
	return monthStatus({
		month,
		reports: weeks.flatMap((week) => week.data ?? []),
		lockDate,
		viewedWeek,
	});
}
