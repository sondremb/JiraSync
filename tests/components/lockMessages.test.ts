import { describe, expect, test } from "vitest";
import { IsoDate, IsoMonth, IsoWeek } from "../../src/date-time/IsoWeek";
import {
	lockNotices,
	oneMonthAtATimeNotice,
	overtimeDialogTitle,
} from "../../src/components/lockMessages";

describe("lock messages", () => {
	test("titles the overtime dialog with the month and its weeks", () => {
		expect(
			overtimeDialogTitle({
				month: IsoMonth.parse("2026-11"),
				fromWeek: 44,
				toWeek: 48,
				overtimeHours: 9.5,
				flexBalanceHours: -0.5,
				mandatoryFlex: 0.5,
				mandatoryPayout: 1.5,
				allocatable: 7.5,
			}),
		).toBe("Overtid for november (uke 44–48)");
	});

	test("asks to lock through the first month end", () => {
		expect(oneMonthAtATimeNotice(IsoDate.parse("2026-11-30"))).toBe(
			"Overtid må signeres for én måned om gangen. Lås først timer til og med mandag 30. november.",
		);
	});
});

describe("lockNotices", () => {
	const week = IsoWeek.parse("2026-W49");
	const error = new Error("Bekk sa nei");
	const base = {
		week,
		attempt: { week, refusedUntil: null },
		signingOpen: false,
		error: null,
		succeeded: false,
	};

	test("a failed signing shows in the open dialog, not below the grid", () => {
		expect(lockNotices({ ...base, signingOpen: true, error })).toMatchObject({
			dialogError: error,
			gridError: null,
		});
	});

	test("a failed lock without the dialog shows below the grid", () => {
		expect(lockNotices({ ...base, error })).toMatchObject({
			dialogError: null,
			gridError: error,
		});
	});

	test("the outcome stays in the week the lock was attempted from", () => {
		const refusedUntil = IsoDate.parse("2026-11-30");
		const otherWeek = {
			...base,
			week: IsoWeek.parse("2026-W48"),
			attempt: { week, refusedUntil },
		};
		expect(lockNotices({ ...otherWeek, error, succeeded: true })).toEqual({
			dialogError: null,
			gridError: null,
			locked: false,
			refusedUntil: null,
		});
		expect(lockNotices({ ...otherWeek, week }).refusedUntil).toBe(refusedUntil);
	});
});
