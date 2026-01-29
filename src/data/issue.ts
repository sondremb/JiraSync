import { CUSTOM_FIELDS, JiraIssueResult } from "../jira-client";

export interface JiraIssue {
	key: string;
	epicLink: string | null;
	components: string[];
}

export function mapIssue(issue: JiraIssueResult): JiraIssue {
	return {
		key: issue.key,
		epicLink: issue.fields[CUSTOM_FIELDS.epicLink] ?? null,
		components: issue.fields.components?.map((c) => c.id) ?? [],
	};
}
