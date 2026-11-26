import { IsoDate } from "../date-time/IsoWeek";
import {
	BekkTimecodeId,
	BekkEntry,
	JiraIssueId,
	JiraWorklog,
	JiraMatchResult,
} from "./entities";

export interface Policy {
	matchIssues: (issues: JiraIssueId[]) => Promise<JiraMatchResult>;
	selectManaged: (ids: BekkTimecodeId[]) => Promise<Set<BekkTimecodeId>>;
}
export type LoadPolicy = () => Promise<Policy>;

export type LoadJiraWorklogs = (
	from: IsoDate,
	to: IsoDate,
) => Promise<JiraWorklog[]>;

export type LoadBekkEntries = (
	from: IsoDate,
	to: IsoDate,
) => Promise<BekkEntry[]>;
