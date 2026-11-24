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

export type JiraMatchResult = Map<JiraIssueId, IssueMatchResult>;

export type IssueMatchResult =
	| { isMatched: true; timecodeId: InternalTimecodeId }
	| { isMatched: false };

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

/**
 * The employee's lock date. `none` when nothing is locked yet (a new employee),
 * `unknown` while it is loading or failed to load.
 */
export type LockDate =
	| { kind: "unknown" }
	| { kind: "none" }
	| { kind: "date"; date: IsoDate };
export const LockDate = {
	unknown: { kind: "unknown" } as LockDate,
	none: { kind: "none" } as LockDate,
	/** A lock date from a date, or `none` for `null`. */
	of(date: IsoDate | null): LockDate {
		return date === null ? LockDate.none : { kind: "date", date };
	},
	/** Bekk entries on or before the lock date are immutable; an unknown lock date locks every day. */
	isLocked(lockDate: LockDate, date: IsoDate): boolean {
		switch (lockDate.kind) {
			case "unknown":
				return true;
			case "none":
				return false;
			case "date":
				return date <= lockDate.date;
		}
	},
};
