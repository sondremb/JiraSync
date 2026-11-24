import type { IsoDate } from "../../date-time/IsoWeek";
import { LockDate } from "../../reconciliation/entities";
import { DayReport } from "../../reconciliation/entities";
import {
	lockedOutOfSyncDays,
	planSync,
} from "../../reconciliation/syncPreview";

/**
 * One day at a glance, most urgent first:
 * - `unmatched`: has Jira worklogs no rule matches.
 * - `willChange`: syncing will change Bekk hours.
 * - `lockedDiffers`: locked, and Bekk differs from Jira.
 * - `inSync`: has hours, and Bekk matches Jira.
 * - `empty`: no hours.
 */
export type DayStatus =
	| "unmatched"
	| "lockedDiffers"
	| "willChange"
	| "inSync"
	| "empty";

export interface WeekStatus {
	/** Bekk hours on all timecodes that week. */
	bekkHours: number;
	days: Partial<Record<IsoDate, DayStatus>>;
	/** Days `planSync` will change. */
	daysToSync: number;
	/** Days with hours, all in sync. */
	daysInSync: number;
	unmatchedWorklogs: number;
	/** Locked days whose managed hours differ from Jira; see `lockedOutOfSyncDays`. */
	lockedDaysDiffering: number;
}

const bekkHoursOf = (report: DayReport) =>
	Array.from(report.comparisons.values()).reduce(
		(sum, comparison) => sum + comparison.internalHoursWorked,
		0,
	) +
	report.unmanagedInternals.reduce((sum, work) => sum + work.hoursWorked, 0);

const hasHours = (report: DayReport) =>
	report.unmanagedInternals.some((work) => work.hoursWorked !== 0) ||
	Array.from(report.comparisons.values()).some(
		(comparison) =>
			comparison.internalHoursWorked !== 0 ||
			comparison.matchedWork.some((work) => work.hoursWorked !== 0),
	);

const dayStatus = (
	report: DayReport,
	lockDate: LockDate,
	willChange: boolean,
): DayStatus => {
	if (report.unmatchedJiraWork.length > 0) return "unmatched";
	if (willChange) return "willChange";
	const inSync = DayReport.isInSync(report);
	if (!inSync && LockDate.isLocked(lockDate, report.date))
		return "lockedDiffers";
	return hasHours(report) ? "inSync" : "empty";
};

export function toWeekStatus(
	reports: readonly DayReport[],
	lockDate: LockDate,
): WeekStatus {
	const changedDays = new Set(
		planSync(reports, lockDate).map((change) => change.date),
	);
	const days: WeekStatus["days"] = {};
	for (const report of reports) {
		days[report.date] = dayStatus(
			report,
			lockDate,
			changedDays.has(report.date),
		);
	}
	const statuses = Object.values(days);
	return {
		bekkHours: reports.reduce((sum, report) => sum + bekkHoursOf(report), 0),
		days,
		daysToSync: changedDays.size,
		daysInSync: statuses.filter((status) => status === "inSync").length,
		unmatchedWorklogs: reports.reduce(
			(count, report) => count + report.unmatchedJiraWork.length,
			0,
		),
		lockedDaysDiffering: lockedOutOfSyncDays(reports, lockDate).length,
	};
}
