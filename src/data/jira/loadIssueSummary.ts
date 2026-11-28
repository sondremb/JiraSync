import type { JiraIssueKey } from "../issue";
import type { JiraIssueId } from "../../reconciliation/entities";
import { jiraClient } from "./jiraclient";

/** What the UI shows for a Jira issue: its key and title. */
export interface JiraIssueSummary {
	key: JiraIssueKey;
	summary: string;
}

export async function loadIssueSummary(
	issueId: JiraIssueId,
): Promise<JiraIssueSummary> {
	const { response, data } = await jiraClient.GET(
		"/rest/api/3/issue/{issueIdOrKey}",
		{
			params: {
				path: { issueIdOrKey: String(issueId) },
				query: { fields: ["summary"] },
			},
		},
	);
	const summary: unknown = data?.fields?.summary;
	if (!response.ok || !data?.key || typeof summary !== "string")
		throw new Error(`Failed to load Jira issue ${issueId}`);
	return { key: data.key as JiraIssueKey, summary };
}
