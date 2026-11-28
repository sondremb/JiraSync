import { IsoDate, IsoMonth } from "../date-time/IsoWeek";
import type { OvertimeSummary } from "../overtime/overtime";

/** "Overtid for november (uke 44–48)", like Timekeeper. */
export const overtimeDialogTitle = (summary: OvertimeSummary): string =>
	`Overtid for ${IsoMonth.name(summary.month)} (uke ${summary.fromWeek}–${summary.toWeek})`;

/** Why a lock across several month ends was refused. */
export const oneMonthAtATimeNotice = (firstMonthEnd: IsoDate): string =>
	`Overtid må signeres for én måned om gangen. Lås først timer til og med ${IsoDate.formatLong(firstMonthEnd).toLowerCase()}.`;
