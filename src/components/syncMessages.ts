import { IsoDate } from "../date-time/IsoWeek";

/** "1 endring", "3 endringer". */
export const formatChangeCount = (count: number): string =>
	`${count} ${count === 1 ? "endring" : "endringer"}`;

/** Why the locked days are left out of the sync. */
export const lockedDaysNotice = (
	lockDate: IsoDate | undefined,
	lockedDays: readonly IsoDate[],
): string =>
	lockDate === undefined
		? "Låsedato er ukjent, så ingen timer kan synkroniseres."
		: `Låste dager stemmer ikke med Jira og blir ikke synkronisert: ${lockedDays.map(IsoDate.formatLong).join(", ")}.`;
