import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
import { Brand } from "../Utils/brandedTypes";

export type JiraIssueId = Brand<number, "jiraIssueId">;
export interface JiraWorklog {
	issueId: JiraIssueId;
	date: IsoDate;
	hoursWorked: number;
}

export type BekkTimecodeId = Brand<number, "bekkTimecodeId">;
export interface BekkEntry {
	timecodeId: BekkTimecodeId;
	date: IsoDate;
	hoursWorked: number;
}

export type JiraMatchResult = Map<JiraIssueId, IssueMatchResult>;

export type IssueMatchResult =
	| { isMatched: true; timecodeId: BekkTimecodeId }
	| { isMatched: false };

export interface ManagedTimecodeDayComparison {
	timecodeId: BekkTimecodeId;
	bekkHours: number;
	matchedWorklogs: JiraWorklog[];
}
export const ManagedTimecodeDayComparison = {
	empty(timecodeId: BekkTimecodeId): ManagedTimecodeDayComparison {
		return {
			timecodeId,
			bekkHours: 0,
			matchedWorklogs: [],
		};
	},
	jiraHoursWorked(comparison: ManagedTimecodeDayComparison): number {
		return comparison.matchedWorklogs.reduce(
			(sum, jiraWork) => sum + jiraWork.hoursWorked,
			0,
		);
	},
	isInSync(comparison: ManagedTimecodeDayComparison): boolean {
		return (
			ManagedTimecodeDayComparison.jiraHoursWorked(comparison) ===
			comparison.bekkHours
		);
	},
};

export interface DayReport {
	date: IsoDate;
	comparisons: Map<BekkTimecodeId, ManagedTimecodeDayComparison>;
	unmanagedEntries: BekkEntry[];
	unmatchedJiraWorklogs: JiraWorklog[];
}
export const DayReport = {
	empty(date: IsoDate): DayReport {
		return {
			date,
			comparisons: new Map(),
			unmanagedEntries: [],
			unmatchedJiraWorklogs: [],
		};
	},
	isInSync(report: DayReport): boolean {
		const comparisons = Array.from(report.comparisons.values());
		const noMismatchedBekk = comparisons.every((comparison) =>
			ManagedTimecodeDayComparison.isInSync(comparison),
		);
		const noUnmatchedJira = report.unmatchedJiraWorklogs.length === 0;
		return noMismatchedBekk && noUnmatchedJira;
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
	/** The week to open on: the one holding the first unlocked day, or the week of `today` without a lock date. */
	startWeek(lockDate: LockDate, today: Date): IsoWeek {
		return lockDate.kind === "date"
			? IsoWeek.fromIsoDate(IsoDate.addDays(lockDate.date, 1))
			: IsoWeek.fromDate(today);
	},
};
