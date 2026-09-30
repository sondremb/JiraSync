import { IsoDate } from "../date-time/IsoWeek";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueId = Brand<number, "jiraIssueId">;
export interface JiraWork {
	issueId: JiraIssueId;
	date: IsoDate;
	hoursWorked: number;
}

export type InternalTimecodeId = Brand<number, "internalTimecodeID">;
export interface InternalWork {
	timecodeId: InternalTimecodeId;
	date: IsoDate;
	hoursWorked: number;
}

export type JiraMatchResult = { issueId: JiraIssueId } & (
	| { isMatched: true; timecodeId: InternalTimecodeId }
	| { isMatched: false }
);

export interface ManagedTimecodeDayComparison {
	timecodeId: InternalTimecodeId;
	internalHoursWorked: number;
	matchedWork: JiraWork[];
}
export const ManagedTimecodeDayComparison = {
	empty(timecodeId: InternalTimecodeId): ManagedTimecodeDayComparison {
		return {
			timecodeId,
			internalHoursWorked: 0,
			matchedWork: [],
		};
	},
	jiraHoursWorked(comparison: ManagedTimecodeDayComparison): number {
		return comparison.matchedWork.reduce(
			(sum, jiraWork) => sum + jiraWork.hoursWorked,
			0,
		);
	},
	isInSync(comparison: ManagedTimecodeDayComparison): boolean {
		return (
			ManagedTimecodeDayComparison.jiraHoursWorked(comparison) ===
			comparison.internalHoursWorked
		);
	},
};

export interface DayReport {
	date: IsoDate;
	comparisons: Map<InternalTimecodeId, ManagedTimecodeDayComparison>;
	unmanagedInternals: InternalWork[];
	unmatchedJiraWork: JiraWork[];
}
export const DayReport = {
	empty(date: IsoDate): DayReport {
		return {
			date,
			comparisons: new Map(),
			unmanagedInternals: [],
			unmatchedJiraWork: [],
		};
	},
	isInSync(report: DayReport): boolean {
		const comparisons = Array.from(report.comparisons.values());
		const noMismatchedInternal = comparisons.every((comparison) =>
			ManagedTimecodeDayComparison.isInSync(comparison),
		);
		const noUnmatchedJira = report.unmatchedJiraWork.length === 0;
		return noMismatchedInternal && noUnmatchedJira;
	},
};
