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
