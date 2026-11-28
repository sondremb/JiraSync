import { describe, expect, test } from "vitest";
import { IsoMonth, IsoWeek } from "../../src/date-time/IsoWeek";
import {
	monthReviewMessage,
	type MessagePart,
} from "../../src/components/monthReviewMessage";
import type { OutOfSyncWeek } from "../../src/reconciliation/monthReview";

const month = IsoMonth.parse("2026-11");
const week = (n: number, flags: Partial<OutOfSyncWeek> = {}) => ({
	week: IsoWeek.parse(`2026-W${n}`),
	locked: false,
	viewed: false,
	...flags,
});
const link = (n: number): MessagePart => ({
	week: IsoWeek.parse(`2026-W${n}`),
	text: String(n),
});
const outOfSync = (...weeks: OutOfSyncWeek[]) =>
	monthReviewMessage({ kind: "outOfSync", month, weeks });

describe("monthReviewMessage", () => {
	test("says nothing without a review", () => {
		expect(monthReviewMessage(null)).toBeNull();
	});

	test("a month in sync", () => {
		expect(monthReviewMessage({ kind: "inSync", month })).toEqual({
			tone: "success",
			title: "Hele november stemmer",
			parts: [],
		});
	});

	test("a month that couldn't be checked", () => {
		expect(monthReviewMessage({ kind: "error", month })).toEqual({
			tone: "danger",
			title: "Kunne ikke sjekke november",
			parts: [],
		});
	});

	test("links every bad week", () => {
		expect(outOfSync(week(45), week(46), week(47))).toEqual({
			tone: "danger",
			title: "November stemmer ikke",
			parts: ["Sjekk uke ", link(45), ", ", link(46), " og ", link(47), "."],
		});
	});

	test("calls the viewed week 'denne uken', without a link", () => {
		expect(
			outOfSync(week(45), week(46, { viewed: true }), week(47))?.parts,
		).toEqual(["Sjekk uke ", link(45), ", denne uken og uke ", link(47), "."]);
		expect(outOfSync(week(49, { viewed: true }))?.parts).toEqual([
			"Sjekk denne uken.",
		]);
	});

	test("lists locked weeks with the rest, then says they need unlocking", () => {
		expect(
			outOfSync(week(44, { locked: true }), week(49, { viewed: true }))?.parts,
		).toEqual([
			"Sjekk uke ",
			link(44),
			" og denne uken. Uke ",
			link(44),
			" er låst, så den må låses opp først.",
		]);
	});

	test("several locked weeks", () => {
		expect(
			outOfSync(
				week(47, { locked: true, viewed: true }),
				week(48, { locked: true }),
			)?.parts,
		).toEqual([
			"Sjekk denne uken og uke ",
			link(48),
			". Denne uken og uke ",
			link(48),
			" er låst, så de må låses opp først.",
		]);
	});
});
