import type { components } from "../generated/bekk-timekeeper";
import { IsoDate } from "../date-time/IsoWeek";
import { LockDate } from "../reconciliation/entities";

type TimesheetLock = components["schemas"]["TimesheetLockViewModel"];

/**
 * Bekk's lock date response as a `LockDate`: `unknown` until there is a
 * response, `none` when it has no lock date (the employee has never locked).
 */
export const lockDateFromBekk = (
	response: TimesheetLock | undefined,
): LockDate => {
	if (response === undefined) return LockDate.unknown;
	if (!response.lockDate) return LockDate.none;
	// Bekk sends a timestamp; the lock date is its day in Norway.
	return LockDate.of(IsoDate.fromDate(new Date(response.lockDate)));
};
