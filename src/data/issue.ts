import { IsoDate } from "../date-time/IsoWeek";
import { Seconds } from "../types";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueKey = Brand<string, "JiraIssueKey">;
export type JiraIssueId = Brand<number, "JiraIssueId">;
export const JiraIssueId = {
	create: createIssueId,
};
export type JiraAccountId = Brand<string, "JiraAccountId">;
export type JiraComponentId = Brand<string, "JiraComponentId">;
export type JiraProjectKey = Brand<string, "JiraProjectKey">;
export function componentId(s: string): JiraComponentId {
	return s as JiraComponentId;
}

function createIssueId(id: number): JiraIssueId;
function createIssueId(id: string): JiraIssueId;
function createIssueId(id: number | string): JiraIssueId {
	if (typeof id === "string") {
		id = parseInt(id, 10);
	}
	return id as JiraIssueId;
}

export interface Worklog {
	authhorAccountId: JiraAccountId;
	startDate: IsoDate;
	timeSpentSeconds: Seconds;
	issue: JiraIssue;
}

export interface JiraIssue {
	id: JiraIssueId;
	key: JiraIssueKey;
	epicLink: JiraIssueKey | null;
	components: JiraComponentId[];
}

export const CUSTOM_FIELDS = {
	epicLink: "customfield_10014",
} as const;
