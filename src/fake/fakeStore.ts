import { IsoDate, IsoMonth, IsoWeek } from "../date-time/IsoWeek";
import {
	fakeBekkEntries,
	fakeIssues,
	fakeJiraAccount,
	fakeProjects,
	fakeTimecodes,
	fakeWorklogs,
	type FakeIssue,
	type FakeTimecode,
	type WeekdayHours,
} from "./fixtures";
import { matchesIssue, parseJql } from "./jql";
import type { FakeScenario } from "./settings";
import {
	monthsClosedByLock,
	type OvertimeSummary,
	type SignedOvertime,
} from "../overtime/overtime";

export interface FakeWorklog {
	id: number;
	issueId: number;
	authorAccountId: string;
	date: IsoDate;
	/** When the work started: 09:00 Norwegian time on `date`. */
	started: Date;
	hours: number;
}

export interface FakeBekkEntry {
	date: IsoDate;
	timecodeId: number;
	hours: number;
}

/** Like Bekk: a month's overtime counts the ISO weeks whose Sunday is in the month. */
const overtimeWeeks = (month: IsoMonth) => {
	const sundays = IsoDate.range(
		IsoMonth.firstDay(month),
		IsoMonth.lastDay(month),
	).filter((date) => IsoDate.weekday(date) === 7);
	const week = (date: IsoDate) =>
		IsoWeek.toParts(IsoWeek.fromIsoDate(date)).week;
	return { fromWeek: week(sundays[0]), toWeek: week(sundays.at(-1)!) };
};

export interface JqlMatch {
	matchedIssues: number[];
	errors: string[];
}

/**
 * In-memory state behind the fake Jira and Bekk APIs. Writes change what the
 * next read returns; a page reload starts over from the fixtures.
 */
export interface FakeStore {
	accountId: string;
	displayName: string;
	issues(): readonly FakeIssue[];
	/** Worklogs by anyone, on any issue, from `from` to `to` inclusive. */
	worklogsBetween(from: IsoDate, to: IsoDate): FakeWorklog[];
	worklogsForIssue(issueId: number): FakeWorklog[];
	/** Like Jira's `/jql/match`: one result per JQL, in order. */
	matchJqls(issueIds: readonly number[], jqls: readonly string[]): JqlMatch[];
	/** Syntax errors only, like Jira's `/jql/parse` with `validation=none`. */
	jqlSyntaxErrors(jql: string): string[];
	bekkEntries(from: IsoDate, to: IsoDate): FakeBekkEntry[];
	/** Sets the hours, or deletes the entry at 0. Returns validation messages, empty when saved. */
	writeBekkHours(date: IsoDate, timecodeId: number, hours: number): string[];
	/** `null` when the employee has never locked. */
	lockDate(): IsoDate | null;
	/** Like Bekk: a lock that closes a month must sign its overtime. Returns validation messages, empty when locked. */
	lockHours(lockDate: IsoDate, signedOvertime?: SignedOvertime): string[];
	/** The month's overtime: November 2026's numbers from Bekk dev while unsigned, zero once signed. */
	overtimeSummary(month: IsoMonth): OvertimeSummary;
	timecodes(): readonly FakeTimecode[];
	projects(): readonly { key: string; name: string }[];
}

export function createFakeStore({
	today,
	scenario,
}: {
	today: Date;
	scenario: FakeScenario;
}): FakeStore {
	const currentWeek = IsoWeek.fromDate(today);
	const dateOf = ({ week, weekday }: WeekdayHours<unknown>) => {
		let isoWeek = currentWeek;
		for (let i = 0; i > week; i--) isoWeek = IsoWeek.previous(isoWeek);
		return IsoWeek.getDay(isoWeek, weekday);
	};

	const worklogs: FakeWorklog[] = fakeWorklogs.map((fixture, index) => {
		const date = dateOf(fixture);
		return {
			id: 20000 + index,
			issueId: fixture.on.issueId,
			authorAccountId: fixture.on.authorAccountId,
			date,
			started: IsoDate.toDateAt(date, { hours: 9, minutes: 0 }),
			hours: fixture.hours,
		};
	});

	const entryKey = (date: IsoDate, timecodeId: number) =>
		`${date}/${timecodeId}`;
	const entries = new Map<string, FakeBekkEntry>();
	for (const fixture of fakeBekkEntries) {
		const date = dateOf(fixture);
		entries.set(entryKey(date, fixture.on.timecodeId), {
			date,
			timecodeId: fixture.on.timecodeId,
			hours: fixture.hours,
		});
	}

	let lockDate: IsoDate | null =
		scenario === "no-lock-date"
			? null
			: IsoWeek.sunday(IsoWeek.previous(currentWeek));

	const signedMonths = new Set<IsoMonth>();

	const inRange = (date: IsoDate, from: IsoDate, to: IsoDate) =>
		date >= from && date <= to;

	return {
		accountId: fakeJiraAccount.accountId,
		displayName: fakeJiraAccount.displayName,
		issues: () => fakeIssues,
		worklogsBetween: (from, to) =>
			worklogs.filter((log) => inRange(log.date, from, to)),
		worklogsForIssue: (issueId) =>
			worklogs.filter((log) => log.issueId === issueId),
		matchJqls: (issueIds, jqls) =>
			jqls.map((jql) => {
				const parsed = parseJql(jql);
				if (!parsed.ok) return { matchedIssues: [], errors: [parsed.error] };
				try {
					return {
						matchedIssues: fakeIssues
							.filter((i) => issueIds.includes(i.id))
							.filter((i) => matchesIssue(parsed.expr, i))
							.map((i) => i.id),
						errors: [],
					};
				} catch (error) {
					return { matchedIssues: [], errors: [(error as Error).message] };
				}
			}),
		jqlSyntaxErrors: (jql) => {
			const parsed = parseJql(jql);
			return parsed.ok ? [] : [parsed.error];
		},
		bekkEntries: (from, to) =>
			[...entries.values()].filter((entry) => inRange(entry.date, from, to)),
		writeBekkHours: (date, timecodeId, hours) => {
			// Like Bekk: no lock date means nothing is locked yet.
			if (lockDate !== null && date <= lockDate) {
				return [`Timene for ${date} er låst`];
			}
			if (hours === 0) {
				entries.delete(entryKey(date, timecodeId));
			} else {
				entries.set(entryKey(date, timecodeId), { date, timecodeId, hours });
			}
			return [];
		},
		lockDate: () => lockDate,
		lockHours: (date, signedOvertime) => {
			const closed = monthsClosedByLock(lockDate, date);
			if (closed.length > 0 && !signedOvertime) {
				return ["Signering av overtid må angis når måneden låses."];
			}
			if (closed.length > 1) {
				return ["Overtid kan bare signeres for én måned om gangen."];
			}
			if (
				signedOvertime &&
				closed.length === 1 &&
				closed[0] !== IsoMonth.fromParts(signedOvertime)
			) {
				return [`Overtiden må signeres for ${closed[0]}.`];
			}
			if (closed.length === 1 && signedOvertime) {
				signedMonths.add(closed[0]);
			}
			lockDate = date;
			return [];
		},
		overtimeSummary: (month) => {
			const clearing = [7, 12].includes(IsoMonth.toParts(month).month)
				? { halfYearClearing: { payoutHours: 2, deletedHours: 0 } }
				: {};
			return {
				month,
				...overtimeWeeks(month),
				flexBalanceHours: -0.5,
				overtimeHours: 9.5,
				...(signedMonths.has(month)
					? { mandatoryPayout: 0, mandatoryFlex: 0, allocatable: 0 }
					: {
							mandatoryPayout: 1.5,
							mandatoryFlex: 0.5,
							allocatable: 7.5,
							...clearing,
						}),
			};
		},
		timecodes: () => fakeTimecodes,
		projects: () => fakeProjects,
	};
}
