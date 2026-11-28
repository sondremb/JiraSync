import { IsoDate, IsoMonth, type IsoWeek } from "../date-time/IsoWeek";
import type { OvertimeSummary } from "../overtime/overtime";

/** "Overtid for november (uke 44–48)", like Timekeeper. */
export const overtimeDialogTitle = (summary: OvertimeSummary): string =>
	`Overtid for ${IsoMonth.name(summary.month)} (uke ${summary.fromWeek}–${summary.toWeek})`;

/** Why a lock across several month ends was refused. */
export const oneMonthAtATimeNotice = (firstMonthEnd: IsoDate): string =>
	`Overtid må signeres for én måned om gangen. Lås først timer til og med ${IsoDate.formatLong(firstMonthEnd).toLowerCase()}.`;

/** The last lock attempt: the week it was made in, and the first month end when it was refused for closing several. */
export interface LockAttempt {
	week: IsoWeek;
	refusedUntil: IsoDate | null;
}

export interface LockNotices {
	dialogError: Error | null;
	gridError: Error | null;
	locked: boolean;
	refusedUntil: IsoDate | null;
}

/**
 * Where the lock's outcome shows: a failed signing in the overtime dialog while
 * it's open, everything else below the grid, but only in the week the lock was
 * attempted from.
 */
export function lockNotices({
	week,
	attempt,
	signingOpen,
	error,
	succeeded,
}: {
	week: IsoWeek;
	attempt: LockAttempt | null;
	signingOpen: boolean;
	error: Error | null;
	succeeded: boolean;
}): LockNotices {
	const thisWeek = attempt !== null && attempt.week === week;
	return {
		dialogError: signingOpen ? error : null,
		gridError: thisWeek && !signingOpen ? error : null,
		locked: thisWeek && succeeded,
		refusedUntil: thisWeek ? attempt.refusedUntil : null,
	};
}
