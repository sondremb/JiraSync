import { IsoDate } from "../date-time/IsoWeek";
import { CUSTOM_FIELDS, JiraIssueResult } from "../jira-client";
import { Seconds } from "../types";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueKey = Brand<string, "JiraIssueKey">;
export type JiraIssueId = Brand<string, "JiraIssueId">;
export type JiraAccountId = Brand<string, "JiraAccountId">;

export interface Worklog {
	authhorAccountId: JiraAccountId;
	issueId: JiraIssueId;
	issueKey: JiraIssueKey;
	startDate: IsoDate;
	timeSpentSeconds: Seconds;
}

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
