import { JiraIssueId } from "../../reconciliation/entities";
import { Jql } from "../../rules";
import { jiraClient } from "./jiraclient";

export async function matchJqls(issueIds: JiraIssueId[], jqls: Jql[]) {
	const { response, data } = await jiraClient.POST("/rest/api/3/jql/match", {
		body: {
			issueIds,
			jqls,
		},
	});
	if (!response.ok || !data) {
		throw new Error("Failed to match JQL");
	}
	if (data.matches.some((jqlMatch) => jqlMatch.errors.length > 0)) {
		throw new Error("Internal error when matching JQL");
	}

	return data.matches.map((match) => ({
		matchedIssues: match.matchedIssues.map((id) => id as JiraIssueId),
	}));
}
