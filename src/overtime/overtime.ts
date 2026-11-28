import { IsoMonth, type IsoDate } from "../date-time/IsoWeek";
import type { LockDate } from "../reconciliation/entities";

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
): IsoMonth[] {
	if (previous === null) {
		const month = IsoMonth.fromIsoDate(next);
		return IsoMonth.lastDay(month) === next ? [month] : [];
	}
	const closed: IsoMonth[] = [];
	for (
		let month = IsoMonth.fromIsoDate(previous);
		IsoMonth.lastDay(month) <= next;
		month = IsoMonth.next(month)
	) {
		if (IsoMonth.lastDay(month) > previous) closed.push(month);
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
	| { kind: "sign-overtime"; month: IsoMonth }
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
		firstMonthEnd: IsoMonth.lastDay(closed[0]),
	};
}

/** Bekk's overtime for one month, before it is signed. */
export interface OvertimeSummary {
	month: IsoMonth;
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

/** The body that signs a month's overtime: totals, mandatory hours included. `month` is 1–12, as Bekk takes it. */
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
		signed: { ...IsoMonth.toParts(summary.month), payoutHours, flexHours },
		payoutHours,
		flexBalanceHours: summary.flexBalanceHours + flexHours,
	};
}

/**
 * The split slider's step. A range input snaps to multiples of its step and
 * can't reach a max between them, so the step must divide `allocatable`.
 */
export function splitStep(allocatable: number): number | "any" {
	return (
		[0.5, 0.25].find((step) => Number.isInteger(allocatable / step)) ?? "any"
	);
}
