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

export function planSync(reports: readonly DayReport[]): ProposedChange[] {
	return reports.flatMap((report) =>
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
		}),
	);
}
