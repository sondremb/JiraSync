import type { IsoDate } from "../../date-time/IsoWeek";
import {
	ManagedTimecodeDayComparison,
	type DayReport,
	type InternalTimecodeId,
} from "../../reconciliation/entities";

export interface GridDay {
	bekkHours: number;
	totalJiraHours: number;
}

export interface GridEntry {
	id: InternalTimecodeId;
	managed: boolean;
	days: Partial<Record<IsoDate, GridDay>>;
}

export function toGridEntries(reports: readonly DayReport[]): GridEntry[] {
	const entries = new Map<InternalTimecodeId, GridEntry>();
	const getEntry = (id: InternalTimecodeId, managed: boolean): GridEntry => {
		let entry = entries.get(id);
		if (!entry) {
			entry = { id, managed, days: {} };
			entries.set(id, entry);
		} else if (entry.managed !== managed) {
			throw new Error(
				`Timecode ${id} has inconsistent management across reports`,
			);
		}
		return entry;
	};

	for (const report of reports) {
		for (const comparison of report.comparisons.values()) {
			const entry = getEntry(comparison.timecodeId, true);
			const day = (entry.days[report.date] ??= {
				bekkHours: 0,
				totalJiraHours: 0,
			});
			day.bekkHours += comparison.internalHoursWorked;
			day.totalJiraHours +=
				ManagedTimecodeDayComparison.jiraHoursWorked(comparison);
		}
		for (const work of report.unmanagedInternals) {
			const entry = getEntry(work.timecodeId, false);
			const day = (entry.days[report.date] ??= {
				bekkHours: 0,
				totalJiraHours: 0,
			});
			day.bekkHours += work.hoursWorked;
		}
	}
	return [...entries.values()];
}

/**
 * What one timecode on one day shows:
 * - `empty`: no hours in either system.
 * - `unmanaged`: Bekk hours on a timecode the ruleset doesn't manage, never synced.
 * - `inSync`: Bekk matches Jira.
 * - `willChange`: Bekk differs from Jira, and syncing will fix it.
 * - `lockedDiffers`: Bekk differs from Jira, but the day is locked.
 */
export type CellState =
	| "empty"
	| "unmanaged"
	| "inSync"
	| "willChange"
	| "lockedDiffers";

export function cellState(
	day: GridDay | undefined,
	managed: boolean,
	locked: boolean,
): CellState {
	const bekkHours = day?.bekkHours ?? 0;
	const jiraHours = day?.totalJiraHours ?? 0;
	if (bekkHours === 0 && jiraHours === 0) return "empty";
	if (!managed) return "unmanaged";
	if (bekkHours === jiraHours) return "inSync";
	return locked ? "lockedDiffers" : "willChange";
}
