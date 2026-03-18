import { CUSTOM_FIELDS, JiraIssueResult } from "../jira-client";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueKey = Brand<string, "JiraIssueKey">;

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
