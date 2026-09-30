import { IsoDate } from "../date-time/IsoWeek";
import {
	InternalTimecodeId,
	InternalWork,
	JiraIssueId,
	JiraMatchResult,
	JiraWork,
} from "./entities";

export interface Policy {
	matchIssues: (
		work: JiraIssueId[],
	) => Promise<Map<JiraIssueId, JiraMatchResult>>;
	getManagedTimecodes: () => Promise<Set<InternalTimecodeId>>;
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
