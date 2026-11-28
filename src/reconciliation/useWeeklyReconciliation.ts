import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { IsoWeek } from "../date-time/IsoWeek";
import { loadBekkEntries } from "../data/loadBekkEntries";
import { loadJiraWorklogs } from "../data/jira/loadJiraWorklogs";
import { writeBekkHours } from "../data/writeBekkHours";
import { Ruleset } from "../rules";
import { createJqlPolicy } from "./implementation/jqlPolicy";
import { reconcilePeriod } from "./reconcile";
import { ProposedChange } from "./syncPreview";
import { syncWeek } from "./syncWeek";
import { matchJqls } from "../data/jira/matchJqls";

export const reconciliationQueryKey = (week: IsoWeek, ruleset: Ruleset) => [
	"reconciliation",
	week,
	ruleset.id,
	ruleset.rules,
];

/** The week's reconciliation query, shared by the week view and the month review. */
export const weeklyReconciliationQuery = (week: IsoWeek, ruleset: Ruleset) =>
	queryOptions({
		queryKey: reconciliationQueryKey(week, ruleset),
		queryFn: () =>
			reconcilePeriod(
				IsoWeek.monday(week),
				IsoWeek.sunday(week),
				loadJiraWorklogs,
				async () => createJqlPolicy(ruleset, matchJqls),
				loadBekkEntries,
			),
	});

export function useWeeklyReconciliation(week: IsoWeek, ruleset: Ruleset) {
	return useQuery(weeklyReconciliationQuery(week, ruleset));
}

export function useSyncWeek() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: (changes: readonly ProposedChange[]) =>
			syncWeek(changes, writeBekkHours),
		onSettled: async () => {
			await client.invalidateQueries({ queryKey: ["reconciliation"] });
		},
	});
}
