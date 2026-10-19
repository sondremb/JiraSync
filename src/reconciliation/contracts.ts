import { IsoDate } from "../date-time/IsoWeek";
import {
	InternalTimecodeId,
	InternalWork,
	JiraIssueId,
	JiraWork,
	JiraMatchResult,
} from "./entities";

export interface Policy {
	matchIssues: (issues: JiraIssueId[]) => Promise<JiraMatchResult>;
	selectManaged: (
		ids: InternalTimecodeId[],
	) => Promise<Set<InternalTimecodeId>>;
}
export type LoadPolicy = () => Promise<Policy>;

export type LoadJiraWorklogs = (
	from: IsoDate,
	to: IsoDate,
) => Promise<JiraWork[]>;

export type LoadInternalWorklogs = (
	from: IsoDate,
	to: IsoDate,
) => Promise<InternalWork[]>;
