import { IsoDate } from "../date-time/IsoWeek";
import type { LockDate } from "../reconciliation/entities";

/** "1 endring", "3 endringer". */
export const formatChangeCount = (count: number): string =>
	`${count} ${count === 1 ? "endring" : "endringer"}`;

/** Why the locked days are left out of the sync. */
export const lockedDaysNotice = (
	lockDate: LockDate,
	lockedDays: readonly IsoDate[],
): string =>
	lockDate.kind === "unknown"
		? "Låsedato er ukjent, så ingen timer kan synkroniseres."
		: `Låste dager stemmer ikke med Jira og blir ikke synkronisert: ${lockedDays.map(IsoDate.formatLong).join(", ")}.`;
