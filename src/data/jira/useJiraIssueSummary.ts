import { useQuery } from "@tanstack/react-query";
import type { JiraIssueId } from "../../reconciliation/entities";
import { loadIssueSummary, type JiraIssueSummary } from "./loadIssueSummary";

/** Undefined while loading or if Jira fails; the caller falls back to the ID. */
export const useJiraIssueSummary = (
	issueId: JiraIssueId,
): JiraIssueSummary | undefined => {
	const { data } = useQuery({
		queryKey: ["jira", "issueSummary", issueId],
		staleTime: Infinity,
		queryFn: () => loadIssueSummary(issueId),
	});
	return data;
};
