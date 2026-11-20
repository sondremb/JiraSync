import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IsoWeek } from "../date-time/IsoWeek";
import { loadInternalWorklogs } from "../data/loadInternalWorklogs";
import { loadJiraWorklogs } from "../data/jira/loadJiraWorklogs";
import { writeInternalHours } from "../data/writeInternalHours";
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

export function useWeeklyReconciliation(week: IsoWeek, ruleset: Ruleset) {
	return useQuery({
		queryKey: reconciliationQueryKey(week, ruleset),
		queryFn: () =>
			reconcilePeriod(
				IsoWeek.monday(week),
				IsoWeek.sunday(week),
				loadJiraWorklogs,
				async () => createJqlPolicy(ruleset, matchJqls),
				loadInternalWorklogs,
			),
	});
}

export function useSyncWeek() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: (changes: readonly ProposedChange[]) =>
			syncWeek(changes, writeInternalHours),
		onSettled: async () => {
			await client.invalidateQueries({ queryKey: ["reconciliation"] });
		},
	});
}
