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

describe("IsoDate.toDateAt", () => {
	test("Returns correct UTC instant for a given Oslo wall time (winter)", () => {
		// 2025-01-15 09:00 Oslo = 08:00 UTC (UTC+1)
		const result = IsoDate.toDateAt("2025-01-15" as IsoDate, { hours: 9, minutes: 0 });
		expect(result.toISOString()).toBe("2025-01-15T08:00:00.000Z");
	});

	test("Returns correct UTC instant for a given Oslo wall time (summer)", () => {
		// 2025-07-15 09:00 Oslo = 07:00 UTC (UTC+2)
		const result = IsoDate.toDateAt("2025-07-15" as IsoDate, { hours: 9, minutes: 0 });
		expect(result.toISOString()).toBe("2025-07-15T07:00:00.000Z");
	});

	test("Accepts optional seconds", () => {
		// 2025-01-15 08:30:45 Oslo = 07:30:45 UTC
		const result = IsoDate.toDateAt("2025-01-15" as IsoDate, { hours: 8, minutes: 30, seconds: 45 });
		expect(result.toISOString()).toBe("2025-01-15T07:30:45.000Z");
	});

	test("Defaults seconds to 0 when omitted", () => {
		const result = IsoDate.toDateAt("2025-06-01" as IsoDate, { hours: 0, minutes: 0 });
		expect(result.getUTCSeconds()).toBe(0);
	});

	test("fromDate(toDateAt(...)) round-trips back to the same IsoDate", () => {
		const iso = "2025-06-15" as IsoDate;
		expect(IsoDate.fromDate(IsoDate.toDateAt(iso, { hours: 8, minutes: 0 }))).toBe(iso);
		expect(IsoDate.fromDate(IsoDate.toDateAt(iso, { hours: 23, minutes: 59, seconds: 59 }))).toBe(iso);
	});

	test("DST spring-forward: 2025-03-30 is handled correctly", () => {
		// Norway springs forward at 02:00 -> 03:00 on 2025-03-30
		// 08:00 Oslo (CEST, UTC+2) = 06:00 UTC
		const result = IsoDate.toDateAt("2025-03-30" as IsoDate, { hours: 8, minutes: 0 });
		expect(result.toISOString()).toBe("2025-03-30T06:00:00.000Z");
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
