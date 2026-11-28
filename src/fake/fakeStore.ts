import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
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
	YearMonth,
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

export interface FakeOvertimeSummary {
	month: YearMonth;
	fromWeek: number;
	toWeek: number;
	flexBalanceHours: number;
	overtimeHours: number;
	mandatoryPayout: number;
	mandatoryFlex: number;
	allocatable: number;
	/** July and December only. */
	halfYearClearing?: { payout: number; deletion: number };
	signed?: SignedOvertime;
}

/** Like Bekk: a month's overtime counts the ISO weeks whose Sunday is in the month. */
const overtimeWeeks = (month: YearMonth) => {
	const sundays = IsoDate.range(
		IsoDate.parse(`${month.year}-${String(month.month).padStart(2, "0")}-01`),
		YearMonth.lastDay(month),
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
	overtimeSummary(month: YearMonth): FakeOvertimeSummary;
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

	const signedMonths = new Map<string, SignedOvertime>();
	const monthKey = ({ year, month }: YearMonth) => `${year}-${month}`;

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
				monthKey(closed[0]) !== monthKey(signedOvertime)
			) {
				return [`Overtiden må signeres for ${monthKey(closed[0])}.`];
			}
			if (closed.length === 1 && signedOvertime) {
				signedMonths.set(monthKey(closed[0]), signedOvertime);
			}
			lockDate = date;
			return [];
		},
		overtimeSummary: (month) => {
			const signed = signedMonths.get(monthKey(month));
			const clearing =
				month.month === 7 || month.month === 12
					? { halfYearClearing: { payout: 2, deletion: 0 } }
					: {};
			return {
				month,
				...overtimeWeeks(month),
				flexBalanceHours: -0.5,
				overtimeHours: 9.5,
				...(signed
					? { mandatoryPayout: 0, mandatoryFlex: 0, allocatable: 0, signed }
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
