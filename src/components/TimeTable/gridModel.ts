import type { IsoDate } from "../../date-time/IsoWeek";
import {
	ManagedTimecodeDayComparison,
	type DayReport,
	type BekkTimecodeId,
	type JiraIssueId,
} from "../../reconciliation/entities";

export interface GridDay {
	bekkHours: number;
	totalJiraHours: number;
}

export interface GridEntry {
	id: BekkTimecodeId;
	managed: boolean;
	days: Partial<Record<IsoDate, GridDay>>;
}

export function toGridEntries(reports: readonly DayReport[]): GridEntry[] {
	const entries = new Map<BekkTimecodeId, GridEntry>();
	const getEntry = (id: BekkTimecodeId, managed: boolean): GridEntry => {
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
			day.bekkHours += comparison.bekkHours;
			day.totalJiraHours +=
				ManagedTimecodeDayComparison.jiraHoursWorked(comparison);
		}
		for (const work of report.unmanagedEntries) {
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

/** Jira hours per day on one issue that no rule matches. */
export interface UnmatchedGridRow {
	issueId: JiraIssueId;
	days: Partial<Record<IsoDate, number>>;
}

/** One row per issue with unmatched Jira worklogs, ordered by issue ID. */
export function toUnmatchedRows(
	reports: readonly DayReport[],
): UnmatchedGridRow[] {
	const rows = new Map<JiraIssueId, UnmatchedGridRow>();
	for (const report of reports) {
		for (const work of report.unmatchedJiraWorklogs) {
			let row = rows.get(work.issueId);
			if (!row) {
				row = { issueId: work.issueId, days: {} };
				rows.set(work.issueId, row);
			}
			row.days[report.date] = (row.days[report.date] ?? 0) + work.hoursWorked;
		}
	}
	return [...rows.values()].sort((a, b) => a.issueId - b.issueId);
}

/**
 * What one timecode on one day shows:
 * - `empty`: no hours in either system.
 * - `unmanaged`: Bekk hours on a timecode the ruleset doesn't manage, never synced.
 * - `inSync`: Bekk matches Jira.
 * - `willChange`: Bekk differs from Jira, and syncing will fix it.
 * - `lockedDiffers`: Bekk differs from Jira, but the day is locked.
 * - `unmatched`: Jira hours on an issue no rule matches, which syncing can't fix.
 */
export type CellState =
	| "empty"
	| "unmanaged"
	| "inSync"
	| "willChange"
	| "lockedDiffers"
	| "unmatched";

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

/** An unmatched issue's cell: its Jira hours that day, or nothing. */
export function unmatchedCellState(hours: number | undefined): CellState {
	return hours ? "unmatched" : "empty";
}
