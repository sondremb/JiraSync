import { IsoDate } from "../date-time/IsoWeek";
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

export const CUSTOM_FIELDS = {
	epicLink: "customfield_10001",
	epicName: "customfield_10003",
	labels: "labels",
} as const;
