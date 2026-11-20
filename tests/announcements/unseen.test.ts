import { describe, expect, test } from "vitest";
import { type Announcement } from "../../src/announcements/announcements";
import {
	loadSeenUpTo,
	newestDate,
	saveSeenUpTo,
	seenUpToStorageKey,
	unseenAnnouncements,
} from "../../src/announcements/unseen";
import { type IsoDate } from "../../src/date-time/IsoWeek";
import { type KeyValueStorage } from "../../src/Utils/safeStorage";

const date = (s: string) => s as IsoDate;
const announcement = (id: string, d: string): Announcement => ({
	id,
	date: date(d),
	text: `Text ${id}`,
});

const old = announcement("old", "2026-09-01");
const a = announcement("a", "2026-11-01");
const b = announcement("b", "2026-11-10");
const c = announcement("c", "2026-11-18");
const all = [old, a, b, c];
const today = date("2026-11-19");

const ids = (list: Announcement[]) => list.map((x) => x.id);

describe("unseenAnnouncements", () => {
	test("nothing seen → only announcements from the last 30 days", () => {
		expect(ids(unseenAnnouncements(all, null, today))).toEqual(["a", "b", "c"]);
	});

	test("nothing seen includes the announcement exactly 30 days old", () => {
		const edge = announcement("edge", "2026-10-20");
		const tooOld = announcement("tooOld", "2026-10-19");
		expect(ids(unseenAnnouncements([tooOld, edge], null, today))).toEqual([
			"edge",
		]);
	});

	test("seen up to A → only those dated after A", () => {
		expect(ids(unseenAnnouncements(all, a.date, today))).toEqual(["b", "c"]);
	});

	test("seen up to an old date shows older-than-30-days announcements too", () => {
		expect(ids(unseenAnnouncements(all, date("2026-08-01"), today))).toEqual([
			"old",
			"a",
			"b",
			"c",
		]);
	});

	test("everything seen → nothing", () => {
		expect(unseenAnnouncements(all, c.date, today)).toEqual([]);
	});

	test("empty list → nothing", () => {
		expect(unseenAnnouncements([], null, today)).toEqual([]);
		expect(unseenAnnouncements([], a.date, today)).toEqual([]);
	});

	test("orders oldest first", () => {
		expect(ids(unseenAnnouncements([c, a, b], null, today))).toEqual([
			"a",
			"b",
			"c",
		]);
	});
});

describe("newestDate", () => {
	test("is the date of the newest shown announcement", () => {
		expect(newestDate([a, c, b])).toBe(c.date);
	});

	test("is null for nothing shown", () => {
		expect(newestDate([])).toBeNull();
	});
});

function fakeStorage(initial: string | null = null) {
	const storage = {
		value: initial,
		getItem: () => storage.value,
		setItem: (_key: string, value: string) => {
			storage.value = value;
		},
	};
	return storage;
}

const throwing: KeyValueStorage = {
	getItem: () => {
		throw new Error("blocked");
	},
	setItem: () => {
		throw new Error("blocked");
	},
};

describe("seen-up-to storage", () => {
	test("round-trips the date", () => {
		const storage = fakeStorage();
		saveSeenUpTo(storage, b.date);
		expect(storage.value).toBe("2026-11-10");
		expect(loadSeenUpTo(storage)).toBe(b.date);
	});

	test("nothing stored → null", () => {
		expect(loadSeenUpTo(fakeStorage())).toBeNull();
	});

	test("a malformed value counts as nothing stored", () => {
		expect(loadSeenUpTo(fakeStorage("garbage"))).toBeNull();
	});

	test("blocked storage never throws", () => {
		expect(loadSeenUpTo(throwing)).toBeNull();
		expect(() => saveSeenUpTo(throwing, b.date)).not.toThrow();
	});

	test("uses a stable storage key", () => {
		expect(seenUpToStorageKey).toBe("jirasync.announcementsSeenUpTo");
	});
});
