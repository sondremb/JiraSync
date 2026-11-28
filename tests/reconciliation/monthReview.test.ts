import { describe, expect, test } from "vitest";
import { IsoDate, IsoMonth, IsoWeek } from "../../src/date-time/IsoWeek";
import {
	DayReport,
	LockDate,
	type BekkTimecodeId,
	type JiraIssueId,
} from "../../src/reconciliation/entities";
import {
	monthStatus,
	monthToCheck,
	reviewMonth,
} from "../../src/reconciliation/monthReview";

const d = IsoDate.parse;
const w = IsoWeek.parse;
const lockedThrough = (date: string) => LockDate.of(d(date));
const november = IsoMonth.parse("2026-11");

describe("monthToCheck", () => {
	describe("November 2026, which ends on a Monday", () => {
		const lockDate = lockedThrough("2026-11-22");

		test("isn't checked in week 48, which doesn't contain the month end", () => {
			expect(monthToCheck(d("2026-11-29"), lockDate)).toBeNull();
		});

		test("is checked all of week 49, which contains the 30th", () => {
			expect(monthToCheck(d("2026-11-30"), lockDate)).toBe(november);
			expect(monthToCheck(d("2026-12-06"), lockDate)).toBe(november);
		});

		test("is checked after week 49 until it is locked", () => {
			expect(monthToCheck(d("2026-12-07"), lockedThrough("2026-11-29"))).toBe(
				november,
			);
			expect(
				monthToCheck(d("2026-12-07"), lockedThrough("2026-11-30")),
			).toBeNull();
		});
	});

	describe("May 2026, which ends on a Sunday", () => {
		const may = IsoMonth.parse("2026-05");

		test("is checked in week 22 by today's week", () => {
			expect(monthToCheck(d("2026-05-25"), lockedThrough("2026-05-24"))).toBe(
				may,
			);
		});

		test("is checked from Monday 1 June because it isn't locked", () => {
			expect(monthToCheck(d("2026-06-01"), lockedThrough("2026-05-24"))).toBe(
				may,
			);
		});

		test("isn't checked once locked through the 31st", () => {
			expect(
				monthToCheck(d("2026-06-01"), lockedThrough("2026-05-31")),
			).toBeNull();
		});
	});

	test("an employee who has never locked only gets today's week's month", () => {
		expect(monthToCheck(d("2026-05-31"), LockDate.none)).toBe(
			IsoMonth.parse("2026-05"),
		);
		expect(monthToCheck(d("2026-06-01"), LockDate.none)).toBeNull();
	});

	test("an unknown lock date checks nothing", () => {
		expect(monthToCheck(d("2026-11-30"), LockDate.unknown)).toBeNull();
	});

	test("a locked month is still checked in the week that contains its end", () => {
		expect(monthToCheck(d("2026-12-02"), lockedThrough("2026-11-30"))).toBe(
			november,
		);
	});

	test("when two months qualify, the earliest is checked", () => {
		expect(monthToCheck(d("2026-11-30"), lockedThrough("2026-09-30"))).toBe(
			IsoMonth.parse("2026-10"),
		);
	});
});

const code = 201 as BekkTimecodeId;
const issue = 101 as JiraIssueId;

/** A day whose Bekk hours differ from Jira. */
const outOfSync = (date: string) => {
	const report = DayReport.empty(d(date));
	report.comparisons.set(code, {
		timecodeId: code,
		bekkHours: 1,
		matchedWorklogs: [{ issueId: issue, date: d(date), hoursWorked: 2 }],
	});
	return report;
};
const inSync = (date: string) => DayReport.empty(d(date));

/** Every day of November's weeks (26 Oct–6 Dec), in sync unless listed. */
const novemberWeeks = (...outOfSyncDays: string[]) =>
	IsoDate.range(d("2026-10-26"), d("2026-12-06")).map((date) =>
		outOfSyncDays.includes(date) ? outOfSync(date) : inSync(date),
	);

describe("monthStatus", () => {
	const base = {
		month: november,
		lockDate: lockedThrough("2026-11-22"),
		viewedWeek: w("2026-W49"),
	};

	test("is in sync when only days outside the month differ", () => {
		expect(
			monthStatus({
				...base,
				reports: novemberWeeks("2026-10-31", "2026-12-01"),
			}),
		).toEqual({ kind: "inSync", month: november });
	});

	test("counts the days of weeks spanning the month boundary", () => {
		expect(
			monthStatus({
				...base,
				reports: novemberWeeks("2026-11-01", "2026-11-30"),
			}),
		).toEqual({
			kind: "outOfSync",
			month: november,
			weeks: [
				{ week: w("2026-W44"), locked: true, viewed: false },
				{ week: w("2026-W49"), locked: false, viewed: true },
			],
		});
	});

	test("lists every bad week once, marking the locked ones and the viewed one", () => {
		const status = monthStatus({
			...base,
			viewedWeek: w("2026-W48"),
			reports: novemberWeeks(
				"2026-11-10",
				"2026-11-11",
				"2026-11-24",
				"2026-11-27",
			),
		});
		expect(status).toEqual({
			kind: "outOfSync",
			month: november,
			weeks: [
				{ week: w("2026-W46"), locked: true, viewed: false },
				{ week: w("2026-W48"), locked: false, viewed: true },
			],
		});
	});

	test("a week with both locked and unlocked bad days is locked", () => {
		const status = monthStatus({
			...base,
			// Not a lock date Bekk would accept, but it splits the week.
			lockDate: lockedThrough("2026-11-18"),
			reports: novemberWeeks("2026-11-17", "2026-11-19"),
		});
		expect(status).toMatchObject({
			weeks: [{ week: w("2026-W47"), locked: true }],
		});
	});

	test("a locked month in sync needs no message", () => {
		expect(
			monthStatus({
				...base,
				lockDate: lockedThrough("2026-11-30"),
				reports: novemberWeeks(),
			}),
		).toBeNull();
	});

	test("a locked month out of sync is still reported", () => {
		expect(
			monthStatus({
				...base,
				lockDate: lockedThrough("2026-11-30"),
				reports: novemberWeeks("2026-11-30"),
			}),
		).toMatchObject({
			kind: "outOfSync",
			weeks: [{ week: w("2026-W49"), locked: true }],
		});
	});

	test("with no lock date nothing is locked", () => {
		expect(
			monthStatus({
				...base,
				lockDate: LockDate.none,
				reports: novemberWeeks("2026-11-02"),
			}),
		).toMatchObject({ weeks: [{ week: w("2026-W45"), locked: false }] });
	});
});

describe("reviewMonth", () => {
	const base = {
		month: november,
		lockDate: lockedThrough("2026-11-22"),
		viewedWeek: w("2026-W49"),
	};
	const loaded = { data: novemberWeeks(), error: null };

	test("says nothing without a month to check", () => {
		expect(reviewMonth({ ...base, month: null, weeks: [] })).toBeNull();
	});

	test("says nothing while any week is loading", () => {
		expect(
			reviewMonth({ ...base, weeks: [loaded, { error: null }] }),
		).toBeNull();
	});

	test("reports an error if any week failed", () => {
		expect(
			reviewMonth({
				...base,
				weeks: [{ error: new Error("Jira") }, { error: null }],
			}),
		).toEqual({ kind: "error", month: november });
	});

	test("reports the month once every week has loaded", () => {
		expect(reviewMonth({ ...base, weeks: [loaded] })).toEqual({
			kind: "inSync",
			month: november,
		});
	});
});
