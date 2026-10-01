import { useQuery } from "@tanstack/react-query";
import { IsoWeek } from "../date-time/IsoWeek";
import { loadInternalWorklogs } from "../data/loadInternalWorklogs";
import { loadJiraWorklogs } from "../data/jira/loadJiraWorklogs";
import { Ruleset } from "../rules";
import { createJqlPolicy, matchJiraJqls } from "./implementation/jqlPolicy";
import { reconcilePeriod } from "./reconcile";

export function useWeeklyReconciliation(week: IsoWeek, ruleset: Ruleset) {
	return useQuery({
		queryKey: ["reconciliation", week, ruleset.id, ruleset.rules],
		queryFn: () =>
			reconcilePeriod(
				IsoWeek.monday(week),
				IsoWeek.sunday(week),
				loadJiraWorklogs,
				async () => createJqlPolicy(ruleset, matchJiraJqls),
				loadInternalWorklogs,
			),
	});
}
