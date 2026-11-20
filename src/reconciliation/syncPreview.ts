import { IsoDate } from "../date-time/IsoWeek";
import {
	type DayReport,
	type InternalTimecodeId,
	ManagedTimecodeDayComparison,
} from "./entities";

export interface ProposedChange {
	date: IsoDate;
	timecodeId: InternalTimecodeId;
	currentHours: number;
	targetHours: number;
}

/** Bekk entries on or before the lock date are immutable; an unknown lock date locks every day. */
export const isLocked = (date: IsoDate, lockDate: IsoDate | undefined) =>
	lockDate === undefined || date <= lockDate;

const managedMismatches = (report: DayReport): ProposedChange[] =>
	Array.from(report.comparisons.values()).flatMap((comparison) => {
		const targetHours =
			ManagedTimecodeDayComparison.jiraHoursWorked(comparison);
		if (comparison.internalHoursWorked === targetHours) return [];
		return [
			{
				date: report.date,
				timecodeId: comparison.timecodeId,
				currentHours: comparison.internalHoursWorked,
				targetHours,
			},
		];
	});

export function planSync(
	reports: readonly DayReport[],
	lockDate: IsoDate | undefined,
): ProposedChange[] {
	return reports
		.filter((report) => !isLocked(report.date, lockDate))
		.flatMap(managedMismatches);
}

/** Locked days whose managed hours differ from Jira: out of sync, but `planSync` skips them. */
export function lockedOutOfSyncDays(
	reports: readonly DayReport[],
	lockDate: IsoDate | undefined,
): IsoDate[] {
	return reports
		.filter(
			(report) =>
				isLocked(report.date, lockDate) && managedMismatches(report).length > 0,
		)
		.map((report) => report.date);
}
