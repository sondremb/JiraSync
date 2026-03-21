import { IsoDate } from "../date-time/IsoWeek";
import { Seconds } from "../types";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueKey = Brand<string, "JiraIssueKey">;
export type JiraIssueId = Brand<string, "JiraIssueId">;
export type JiraAccountId = Brand<string, "JiraAccountId">;

export interface Worklog {
	authhorAccountId: JiraAccountId;
	startDate: IsoDate;
	timeSpentSeconds: Seconds;
	issue: JiraIssue;
}

export interface JiraIssue {
	components: string[];
	key: JiraIssueKey;
	epicLink: JiraIssueKey | null;
}

export const CUSTOM_FIELDS = {
	epicLink: "customfield_10014",
} as const;
