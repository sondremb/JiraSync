import { IsoDate } from "../date-time/IsoWeek";
import {
	type DayReport,
	type InternalTimecodeId,
	LockDate,
	ManagedTimecodeDayComparison,
} from "./entities";

export interface ProposedChange {
	date: IsoDate;
	timecodeId: InternalTimecodeId;
	currentHours: number;
	targetHours: number;
}

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
	lockDate: LockDate,
): ProposedChange[] {
	return reports
		.filter((report) => !LockDate.isLocked(lockDate, report.date))
		.flatMap(managedMismatches);
}

/** Locked days whose managed hours differ from Jira: out of sync, but `planSync` skips them. */
export function lockedOutOfSyncDays(
	reports: readonly DayReport[],
	lockDate: LockDate,
): IsoDate[] {
	return reports
		.filter(
			(report) =>
				LockDate.isLocked(lockDate, report.date) &&
				managedMismatches(report).length > 0,
		)
		.map((report) => report.date);
}

/** The changes per day, in the order the days first appear. */
export const groupChangesByDate = (
	changes: readonly ProposedChange[],
): [IsoDate, ProposedChange[]][] => {
	const groups = new Map<IsoDate, ProposedChange[]>();
	for (const change of changes) {
		groups.set(change.date, [...(groups.get(change.date) ?? []), change]);
	}
	return Array.from(groups);
};
