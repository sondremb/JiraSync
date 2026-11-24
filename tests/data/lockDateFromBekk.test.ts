import { describe, expect, test } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import { lockDateFromBekk } from "../../src/data/lockDateFromBekk";
import { LockDate } from "../../src/reconciliation/entities";

describe("lockDateFromBekk", () => {
	test("is unknown until there is a response", () => {
		expect(lockDateFromBekk(undefined)).toEqual(LockDate.unknown);
	});

	test("is none when the response has no lock date", () => {
		expect(lockDateFromBekk({ employeeId: 42 })).toEqual(LockDate.none);
	});

	test("is the lock date's day in Norway", () => {
		// 23:30 UTC on 2 February is already 3 February in Norway
		expect(
			lockDateFromBekk({ employeeId: 42, lockDate: "2025-02-02T23:30:00Z" }),
		).toEqual(LockDate.of(IsoDate.parse("2025-02-03")));
	});
});
