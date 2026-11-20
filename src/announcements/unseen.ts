import { IsoDate } from "../date-time/IsoWeek";
import { type KeyValueStorage } from "../Utils/safeStorage";
import { type Announcement } from "./announcements";

/** How far back a device with nothing stored still sees announcements. */
export const firstVisitWindowDays = 30;

export const seenUpToStorageKey = "jirasync.announcementsSeenUpTo";

/**
 * The announcements to show, oldest first: those dated after `seenUpTo`, or,
 * when nothing is stored, those from the last 30 days.
 */
export function unseenAnnouncements(
	announcements: Announcement[],
	seenUpTo: IsoDate | null,
	today: IsoDate,
): Announcement[] {
	const isUnseen =
		seenUpTo === null
			? (date: IsoDate) => date >= IsoDate.addDays(today, -firstVisitWindowDays)
			: (date: IsoDate) => date > seenUpTo;
	return announcements
		.filter((a) => isUnseen(a.date))
		.toSorted((a, b) => a.date.localeCompare(b.date));
}

/** The date to store when the user dismisses `shown`. */
export function newestDate(shown: Announcement[]): IsoDate | null {
	return shown.reduce<IsoDate | null>(
		(newest, a) => (newest === null || a.date > newest ? a.date : newest),
		null,
	);
}

/** Never throws; a missing or malformed value counts as nothing stored. */
export function loadSeenUpTo(storage: KeyValueStorage): IsoDate | null {
	try {
		const value = storage.getItem(seenUpToStorageKey);
		return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value)
			? (value as IsoDate)
			: null;
	} catch {
		return null;
	}
}

/** Never throws; when storage is blocked the dismissal lasts only until reload. */
export function saveSeenUpTo(storage: KeyValueStorage, date: IsoDate): void {
	try {
		storage.setItem(seenUpToStorageKey, date);
	} catch {
		// Storage full or blocked.
	}
}
