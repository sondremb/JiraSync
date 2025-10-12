import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { IsoDate } from "./IsoWeek";

describe("IsoDate.fromDate (Oslo zone logic)", () => {
	test("Summer time: switches at 22:00 UTC (midnight Oslo)", () => {
		const justBefore = new Date("2025-06-29T21:59:59.999Z");
		const justAfter = new Date("2025-06-29T22:00:00.000Z");

		expect(IsoDate.fromDate(justBefore)).toBe("2025-06-29");
		expect(IsoDate.fromDate(justAfter)).toBe("2025-06-30");
	});

	test("Winter time: switches at 23:00 UTC (midnight Oslo)", () => {
		const justBefore = new Date("2025-12-21T22:59:59.999Z");
		const justAfter = new Date("2025-12-21T23:00:00.000Z");

		expect(IsoDate.fromDate(justBefore)).toBe("2025-12-21");
		expect(IsoDate.fromDate(justAfter)).toBe("2025-12-22");
	});
});

describe("IsoDate.fromDate is zone-invariant (always uses Europe/Oslo)", () => {
	let originalTZ: string | undefined;
	beforeAll(() => {
		originalTZ = process.env.TZ;
		process.env.TZ = "UTC";
	});
	afterAll(() => {
		process.env.TZ = originalTZ;
	});

	test("Produces the same date as with Oslo for a given instant", () => {
		// This instant is right around Oslo midnight in summer time
		const instant = new Date("2025-06-29T22:00:00.000Z");
		expect(IsoDate.fromDate(instant)).toBe("2025-06-30");
	});
});

describe("IsoDate.toDate / fromDate round-trips", () => {
	test.each([
		"2024-12-31",
		"2025-01-01",
		"2025-03-31",
		"2025-06-30",
		"2025-10-12",
	])("Round-trip preserves the calendar date for %s", (iso) => {
		const d = IsoDate.toDate(iso as IsoDate);
		expect(IsoDate.fromDate(d)).toBe(iso);
	});

	test("fromDate -> toDate -> fromDate is idempotent across DST boundaries", () => {
		const instants = [
			new Date("2025-03-30T00:59:59.000Z"), // around spring change
			new Date("2025-03-30T01:00:00.000Z"),
			new Date("2025-10-26T00:59:59.000Z"), // around autumn change
			new Date("2025-10-26T01:00:00.000Z"),
		];

		for (const i of instants) {
			const iso = IsoDate.fromDate(i);
			const back = IsoDate.fromDate(IsoDate.toDate(iso));
			expect(back).toBe(iso);
		}
	});
});

describe("IsoDate.range", () => {
	test("Inclusive range over normal days", () => {
		expect(
			IsoDate.range("2025-02-03" as IsoDate, "2025-02-05" as IsoDate)
		).toEqual(["2025-02-03", "2025-02-04", "2025-02-05"]);
	});

	test("Single-day range returns one element", () => {
		expect(
			IsoDate.range("2025-07-15" as IsoDate, "2025-07-15" as IsoDate)
		).toEqual(["2025-07-15"]);
	});

	test("Range across DST start (spring forward)", () => {
		// Norway (Europe/Oslo) DST starts in late March; dates are calendar-stable.
		expect(
			IsoDate.range("2025-03-29" as IsoDate, "2025-03-31" as IsoDate)
		).toEqual(["2025-03-29", "2025-03-30", "2025-03-31"]);
	});

	test("Range across year boundary", () => {
		expect(
			IsoDate.range("2026-12-30" as IsoDate, "2027-01-02" as IsoDate)
		).toEqual(["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
	});

	test("Contiguous +1 day increments (no gaps/dups)", () => {
		const days = IsoDate.range(
			"2026-12-28" as IsoDate,
			"2027-01-03" as IsoDate
		);
		for (let i = 1; i < days.length; i++) {
			const prev = IsoDate.toDate(days[i - 1]).getTime();
			const curr = IsoDate.toDate(days[i]).getTime();
			const deltaDays = (curr - prev) / 86_400_000;
			expect(deltaDays).toBe(1);
		}
	});
});
