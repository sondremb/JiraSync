import { CUSTOM_FIELDS, JiraIssueResult } from "../jira-client";

export interface JiraIssue {
	key: string;
	epicLink: string | null;
}

export function mapIssue(issue: JiraIssueResult): JiraIssue {
	return {
		key: issue.key,
		epicLink: issue.fields[CUSTOM_FIELDS.epicLink] ?? null,
	};
}
