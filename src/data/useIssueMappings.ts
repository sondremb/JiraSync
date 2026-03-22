import { useQuery } from "@tanstack/react-query";
import { Ruleset, Rule } from "../rules";
import { BekkId } from "../types";
import { unique, toRecord } from "../Utils/arrayUtils";
import { JiraIssue, JiraIssueKey, JiraIssueId } from "./issue";
import { jiraClient } from "./jiraclient";

export function useIssueMappings(
	issues: JiraIssue[],
	ruleset: Ruleset,
): Record<JiraIssueKey, BekkId> {
	// viktig at de er sorterte, ellers ville query key forandret seg og man ville mistet cache
	const keys = unique(issues.map((issue) => issue.key)).sort();
	const { data } = useQuery({
		queryKey: ["mapping", "issues", ruleset.id, ...keys],
		queryFn: () => mapIssues(ruleset.rules, issues),
	});
	return data ?? {};
}

async function mapIssues(
	rules: Rule[],
	issues: JiraIssue[],
): Promise<Record<JiraIssueKey, BekkId>> {
	const { response, data } = await jiraClient.POST("/rest/api/3/jql/match", {
		body: {
			issueIds: issues.map((issue) => issue.id as number),
			jqls: rules.map((rule) => Rule.toFullJql(rule)),
		},
	});
	if (!response.ok || !data) {
		throw new Error("Failed to match JQL");
	}
	if (data?.matches.length !== rules.length) {
		throw new Error("Response length does not match rules length");
	}
	const issuesById: Record<JiraIssueId, JiraIssue> = toRecord(
		issues,
		(issue) => issue.id,
	);

	const rulesWithMatches = rules.map((rule, index) => ({
		rule,
		match: data.matches[index],
	}));
	const result: Record<JiraIssueKey, BekkId> = {};
	for (const { rule, match } of rulesWithMatches) {
		for (const issueId of match.matchedIssues) {
			const issueKey = issuesById[issueId as JiraIssueId].key;
			// allerede matchet av en tidligere regel
			if (issueKey in result) {
				continue;
			}

			result[issueKey] = rule.timecode;
		}
	}

	return result;
}
