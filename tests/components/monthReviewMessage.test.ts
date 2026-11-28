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
			parts: ["Hele november stemmer"],
		});
	});

	test("a month that couldn't be checked", () => {
		expect(monthReviewMessage({ kind: "error", month })).toEqual({
			tone: "danger",
			parts: ["Kunne ikke sjekke november"],
		});
	});

	test("links every bad week", () => {
		expect(outOfSync(week(45), week(46), week(47))).toEqual({
			tone: "danger",
			parts: [
				"November stemmer ikke: sjekk uke ",
				link(45),
				", ",
				link(46),
				" og ",
				link(47),
			],
		});
	});

	test("calls the viewed week 'denne uken', without a link", () => {
		expect(
			outOfSync(week(45), week(46, { viewed: true }), week(47))?.parts,
		).toEqual([
			"November stemmer ikke: sjekk uke ",
			link(45),
			", denne uken og uke ",
			link(47),
		]);
		expect(outOfSync(week(49, { viewed: true }))?.parts).toEqual([
			"November stemmer ikke: sjekk denne uken",
		]);
	});

	test("calls out locked weeks after those to fix", () => {
		expect(
			outOfSync(week(44, { locked: true }), week(49, { viewed: true }))?.parts,
		).toEqual([
			"November stemmer ikke: sjekk denne uken. Uke ",
			link(44),
			" er låst",
		]);
	});

	test("only locked weeks", () => {
		expect(
			outOfSync(
				week(47, { locked: true, viewed: true }),
				week(48, { locked: true }),
			)?.parts,
		).toEqual([
			"November stemmer ikke: denne uken og uke ",
			link(48),
			" er låst",
		]);
	});
});
