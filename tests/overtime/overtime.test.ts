import { describe, expect, test } from "vitest";
import { IsoDate, IsoMonth } from "../../src/date-time/IsoWeek";
import { LockDate } from "../../src/reconciliation/entities";
import {
	monthsClosedByLock,
	overtimeOutcome,
	planLock,
	type OvertimeSummary,
} from "../../src/overtime/overtime";

const d = IsoDate.parse;
const m = IsoMonth.parse;

describe("monthsClosedByLock", () => {
	test("a Sunday lock inside a month closes nothing", () => {
		expect(monthsClosedByLock(d("2026-11-22"), d("2026-11-29"))).toEqual([]);
	});

	test("locking through the last day of a month closes it", () => {
		expect(monthsClosedByLock(d("2026-11-22"), d("2026-11-30"))).toEqual([
			m("2026-11"),
		]);
	});

	test("a Sunday lock past a month end closes that month", () => {
		expect(monthsClosedByLock(d("2026-11-29"), d("2026-12-06"))).toEqual([
			m("2026-11"),
		]);
	});

	test("a month already closed by the previous lock date is not closed again", () => {
		expect(monthsClosedByLock(d("2026-11-30"), d("2026-12-06"))).toEqual([]);
	});

	test("a lock across two month ends closes both, across the year", () => {
		expect(monthsClosedByLock(d("2026-11-29"), d("2027-01-03"))).toEqual([
			m("2026-11"),
			m("2026-12"),
		]);
	});

	test("without a lock date, only the month the lock date ends counts", () => {
		expect(monthsClosedByLock(null, d("2026-11-30"))).toEqual([m("2026-11")]);
		expect(monthsClosedByLock(null, d("2026-11-29"))).toEqual([]);
	});
});

describe("planLock", () => {
	const lockedThrough = LockDate.of(d("2026-11-22"));

	test("an unknown lock date doesn't lock", () => {
		expect(planLock(LockDate.unknown, d("2026-11-29"))).toEqual({
			kind: "unknown-lock-date",
		});
	});

	test("a lock within the month locks without signing", () => {
		expect(planLock(lockedThrough, d("2026-11-29"))).toEqual({ kind: "lock" });
	});

	test("a lock that closes a month signs its overtime", () => {
		expect(planLock(lockedThrough, d("2026-11-30"))).toEqual({
			kind: "sign-overtime",
			month: m("2026-11"),
		});
	});

	test("a lock that closes two months asks to lock through the first month end", () => {
		expect(planLock(lockedThrough, d("2026-12-31"))).toEqual({
			kind: "one-month-at-a-time",
			firstMonthEnd: "2026-11-30",
		});
	});
});

describe("overtimeOutcome", () => {
	// November 2026 as Bekk dev reported it, and what Timekeeper signed.
	const november: OvertimeSummary = {
		month: m("2026-11"),
		fromWeek: 44,
		toWeek: 48,
		overtimeHours: 9.5,
		flexBalanceHours: -0.5,
		mandatoryFlex: 0.5,
		mandatoryPayout: 1.5,
		allocatable: 7.5,
	};

	test("a split signs totals, mandatory hours included, like Timekeeper", () => {
		expect(overtimeOutcome(november, { kind: "split", flexHours: 3 })).toEqual({
			signed: { year: 2026, month: 11, payoutHours: 6, flexHours: 3.5 },
			payoutHours: 6,
			flexBalanceHours: 3,
		});
	});

	test("payout pays out all allocatable hours", () => {
		const outcome = overtimeOutcome(november, { kind: "payout" });
		expect(outcome.signed).toMatchObject({ payoutHours: 9, flexHours: 0.5 });
		expect(outcome.flexBalanceHours).toBe(0);
	});

	test("flex puts all allocatable hours in the flex balance", () => {
		const outcome = overtimeOutcome(november, { kind: "flex" });
		expect(outcome.signed).toMatchObject({ payoutHours: 1.5, flexHours: 8 });
		expect(outcome.flexBalanceHours).toBe(7.5);
	});

	test("a split is kept within the allocatable hours", () => {
		expect(
			overtimeOutcome(november, { kind: "split", flexHours: 10 }).signed
				.flexHours,
		).toBe(8);
		expect(
			overtimeOutcome(november, { kind: "split", flexHours: -1 }).signed
				.flexHours,
		).toBe(0.5);
	});

	test("a month without overtime signs zero hours", () => {
		const october: OvertimeSummary = {
			...november,
			month: m("2026-10"),
			overtimeHours: 0,
			flexBalanceHours: 5,
			mandatoryFlex: 0,
			mandatoryPayout: 0,
			allocatable: 0,
		};
		expect(overtimeOutcome(october, { kind: "payout" }).signed).toEqual({
			year: 2026,
			month: 10,
			payoutHours: 0,
			flexHours: 0,
		});
	});
});
