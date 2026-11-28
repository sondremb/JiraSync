import { useQueries } from "@tanstack/react-query";
import { IsoDate, IsoMonth, type IsoWeek } from "../date-time/IsoWeek";
import type { LockDate } from "../reconciliation/entities";
import { monthToCheck, reviewMonth } from "../reconciliation/monthReview";
import { weeklyReconciliationQuery } from "../reconciliation/useWeeklyReconciliation";
import type { Ruleset } from "../rules";
import { monthReviewMessage } from "./monthReviewMessage";

/**
 * The month review line for the viewed week: which billing month to check
 * today, loaded one week query at a time so it shares the week view's cache
 * (and its invalidation after a sync).
 */
export const useMonthReview = (
	viewedWeek: IsoWeek,
	ruleset: Ruleset,
	lockDate: LockDate,
) => {
	const month = monthToCheck(IsoDate.fromDate(new Date()), lockDate);
	const weeks = useQueries({
		queries: (month ? IsoMonth.weeks(month) : []).map((week) =>
			weeklyReconciliationQuery(week, ruleset),
		),
		combine: (results) => results.map(({ data, error }) => ({ data, error })),
	});
	return monthReviewMessage(
		reviewMonth({ month, weeks, lockDate, viewedWeek }),
	);
};
