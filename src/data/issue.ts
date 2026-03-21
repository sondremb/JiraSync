import { IsoDate } from "../date-time/IsoWeek";
import { Seconds } from "../types";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueKey = Brand<string, "JiraIssueKey">;
export type JiraIssueId = Brand<string, "JiraIssueId">;
export type JiraAccountId = Brand<string, "JiraAccountId">;
export type JiraComponentId = Brand<string, "JiraComponentId">;
export function componentId(s: string): JiraComponentId {
	return s as JiraComponentId;
}

export interface Worklog {
	authhorAccountId: JiraAccountId;
	startDate: IsoDate;
	timeSpentSeconds: Seconds;
	issue: JiraIssue;
}

export interface JiraIssue {
	key: JiraIssueKey;
	epicLink: JiraIssueKey | null;
	components: JiraComponentId[];
}

export const CUSTOM_FIELDS = {
	epicLink: "customfield_10014",
} as const;
