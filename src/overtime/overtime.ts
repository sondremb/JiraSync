import { IsoDate, NORWAY_TIMEZONE } from "../date-time/IsoWeek";
import type { LockDate } from "../reconciliation/entities";

/** A calendar month; `month` is 1–12. */
export interface YearMonth {
	year: number;
	month: number;
}

export const YearMonth = {
	of(date: IsoDate): YearMonth {
		const [year, month] = date.split("-").map((part) => parseInt(part, 10));
		return { year, month };
	},
	lastDay({ year, month }: YearMonth): IsoDate {
		const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
		return IsoDate.parse(
			`${year}-${String(month).padStart(2, "0")}-${String(days).padStart(2, "0")}`,
		);
	},
	next({ year, month }: YearMonth): YearMonth {
		return month === 12
			? { year: year + 1, month: 1 }
			: { year, month: month + 1 };
	},
	/** The month's Norwegian name in lower case: "november". */
	name({ year, month }: YearMonth): string {
		return new Intl.DateTimeFormat("nb-NO", {
			month: "long",
			timeZone: NORWAY_TIMEZONE,
		}).format(new Date(Date.UTC(year, month - 1, 15)));
	},
};

/**
 * The months a lock from `previous` through `next` closes: those whose last day
 * is after `previous` and on or before `next`. Bekk requires overtime to be
 * signed for a closed month in the same lock request.
 *
 * Without a previous lock date, only the month `next` ends counts: we can't
 * know where Bekk starts counting, and Bekk rejects the lock if it disagrees.
 */
export function monthsClosedByLock(
	previous: IsoDate | null,
	next: IsoDate,
): YearMonth[] {
	if (previous === null) {
		const month = YearMonth.of(next);
		return YearMonth.lastDay(month) === next ? [month] : [];
	}
	const closed: YearMonth[] = [];
	for (
		let month = YearMonth.of(previous);
		YearMonth.lastDay(month) <= next;
		month = YearMonth.next(month)
	) {
		if (YearMonth.lastDay(month) > previous) closed.push(month);
	}
	return closed;
}

/** What locking through a day takes. */
export type LockPlan =
	/** The lock date is still loading or failed to load: don't lock. */
	| { kind: "unknown-lock-date" }
	/** The lock closes no month, so needs no overtime signing. */
	| { kind: "lock" }
	/** The lock closes one month, whose overtime must be signed in the same request. */
	| { kind: "sign-overtime"; month: YearMonth }
	/** The lock closes several months, but one request can only sign one: lock through `firstMonthEnd` first. */
	| { kind: "one-month-at-a-time"; firstMonthEnd: IsoDate };

export function planLock(lockDate: LockDate, day: IsoDate): LockPlan {
	if (lockDate.kind === "unknown") return { kind: "unknown-lock-date" };
	const closed = monthsClosedByLock(
		lockDate.kind === "date" ? lockDate.date : null,
		day,
	);
	if (closed.length === 0) return { kind: "lock" };
	if (closed.length === 1) return { kind: "sign-overtime", month: closed[0] };
	return {
		kind: "one-month-at-a-time",
		firstMonthEnd: YearMonth.lastDay(closed[0]),
	};
}

/** Bekk's overtime for one month, before it is signed. */
export interface OvertimeSummary {
	month: YearMonth;
	/** The ISO weeks the month's overtime is counted over. */
	fromWeek: number;
	toWeek: number;
	overtimeHours: number;
	/** The flex balance before signing; negative when the employee owes flex hours. */
	flexBalanceHours: number;
	/** Overtime that must go to the flex balance (to pay back owed flex hours). */
	mandatoryFlex: number;
	/** Overtime that must be paid out. */
	mandatoryPayout: number;
	/** Overtime the employee splits between payout and flex. */
	allocatable: number;
	/** The half-year flex clearing (July and December): flex hours paid out and deleted. */
	halfYearClearing?: { payoutHours: number; deletedHours: number };
}

/** How the employee takes the allocatable overtime. */
export type OvertimeChoice =
	| { kind: "payout" }
	| { kind: "flex" }
	| { kind: "split"; flexHours: number };

/** The body that signs a month's overtime: totals, mandatory hours included. */
export interface SignedOvertime {
	year: number;
	month: number;
	payoutHours: number;
	flexHours: number;
}

export interface OvertimeOutcome {
	signed: SignedOvertime;
	/** Hours paid out for the month's overtime (the half-year clearing comes on top). */
	payoutHours: number;
	/** The flex balance after signing. */
	flexBalanceHours: number;
}

/** The allocatable hours the choice puts in the flex balance. */
export function chosenFlexHours(
	choice: OvertimeChoice,
	allocatable: number,
): number {
	switch (choice.kind) {
		case "payout":
			return 0;
		case "flex":
			return allocatable;
		case "split":
			return Math.min(Math.max(choice.flexHours, 0), allocatable);
	}
}

export function overtimeOutcome(
	summary: OvertimeSummary,
	choice: OvertimeChoice,
): OvertimeOutcome {
	const chosenFlex = chosenFlexHours(choice, summary.allocatable);
	const payoutHours =
		summary.mandatoryPayout + summary.allocatable - chosenFlex;
	const flexHours = summary.mandatoryFlex + chosenFlex;
	return {
		signed: { ...summary.month, payoutHours, flexHours },
		payoutHours,
		flexBalanceHours: summary.flexBalanceHours + flexHours,
	};
}
