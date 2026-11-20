import policiesJson from "../policies/policies.json";
import { loadPolicies } from "../policies/schema";
import type { Ruleset, RulesetId } from "../rules";
import type { JiraProjectKey } from "../data/issue";
import type { BekkId } from "../types";
import { fakeBekkAccount } from "./fakeAccount";

/**
 * The fake dataset. Weeks are relative to today's ISO week, so the default
 * view is always interesting:
 * - this week: changes to sync, an unmatched Jira worklog and an unmanaged entry
 * - last week: locked (the lock date is its Sunday), with one day that disagrees
 * - two weeks back: in sync (and locked)
 */

/** The bundled ruleset the fixtures are written for. */
export const fixtureRulesetId = "new-pas-rules";

export const fakeJiraAccount = {
	accountId: "fake-account-id",
	displayName: fakeBekkAccount.name,
};
const colleagueAccountId = "fake-colleague-id";

export interface FakeIssue {
	id: number;
	key: string;
	projectKey: string;
	components: number[];
	summary: string;
}

export interface FakeTimecode {
	id: number;
	code: string;
	name: string;
	active: boolean;
}

/** Hours on one weekday (1 = Monday) of a week relative to the current one. */
export interface WeekdayHours<T> {
	/** 0 = this week, -1 = last week, … */
	week: number;
	weekday: number;
	hours: number;
	on: T;
}

// Timecodes in the `new-pas-rules` ruleset
const pasxNew = 1003649;
const pasxMaintenance = 1003648;
const paspNew = 1003651;
const paspMaintenance = 1003650;
const so = 1003691;
/** Not in any ruleset, so it is never touched by a sync. */
const unmanagedTimecode = 1000001;

export const fakeIssues: FakeIssue[] = [
	{
		id: 10001,
		key: "PASX-101",
		projectKey: "PASX",
		components: [10121],
		summary: "Ny påmeldingsflyt",
	},
	{
		id: 10002,
		key: "PASX-87",
		projectKey: "PASX",
		components: [],
		summary: "Feil i eksport til PDF",
	},
	{
		id: 10003,
		key: "PASP-12",
		projectKey: "PASP",
		components: [10290],
		summary: "Oppgavebank for prøver",
	},
	{
		id: 10004,
		key: "PASP-20",
		projectKey: "PASP",
		components: [],
		summary: "Oppgradere avhengigheter",
	},
	{
		id: 10005,
		key: "SO-5",
		projectKey: "SO",
		components: [],
		summary: "Driftsmøte",
	},
	// No rule matches the INTERN project
	{
		id: 10006,
		key: "INTERN-3",
		projectKey: "INTERN",
		components: [],
		summary: "Fagdag",
	},
];

const issue = (key: string) => fakeIssues.find((i) => i.key === key)!.id;

/** Jira worklogs by the fake user, as [week, weekday, hours, issue key]. */
const myWorklogs: [number, number, number, string][] = [
	// This week
	[0, 1, 7.5, "PASX-101"],
	[0, 2, 4, "PASX-101"],
	[0, 2, 3.5, "PASX-87"],
	[0, 3, 6, "PASP-12"],
	[0, 3, 1.5, "INTERN-3"],
	[0, 4, 7.5, "SO-5"],
	[0, 5, 5, "PASX-101"],
	// Two weeks back
	[-2, 1, 7.5, "PASX-101"],
	[-2, 2, 7.5, "PASX-87"],
	[-2, 3, 4, "PASP-12"],
	[-2, 3, 3.5, "PASP-20"],
	[-2, 4, 7.5, "SO-5"],
	[-2, 5, 3, "PASX-101"],
	[-2, 5, 4.5, "PASX-87"],
	// Last week
	[-1, 1, 7.5, "PASX-101"],
	[-1, 2, 7.5, "PASX-101"],
	[-1, 3, 7.5, "PASX-87"],
	[-1, 4, 7.5, "SO-5"],
	[-1, 5, 7.5, "PASP-12"],
];

export interface FakeWorklogFixture {
	issueId: number;
	authorAccountId: string;
}

export const fakeWorklogs: WeekdayHours<FakeWorklogFixture>[] = [
	...myWorklogs.map(([week, weekday, hours, key]) => ({
		week,
		weekday,
		hours,
		on: { issueId: issue(key), authorAccountId: fakeJiraAccount.accountId },
	})),
	// Someone else's work on the same issue, which the app must leave out
	{
		week: 0,
		weekday: 1,
		hours: 2,
		on: { issueId: issue("PASX-101"), authorAccountId: colleagueAccountId },
	},
];

/** Bekk timesheet entries, as [week, weekday, hours, timecode]. */
const bekkEntries: [number, number, number, number][] = [
	// This week: Monday matches; Tuesday misses PASX maintenance; Wednesday has
	// too few hours; Thursday is empty; Friday has a Bekk entry with no Jira
	// worklog, and an unmanaged entry.
	[0, 1, 7.5, pasxNew],
	[0, 2, 4, pasxNew],
	[0, 3, 5, paspNew],
	[0, 5, 2, pasxMaintenance],
	[0, 5, 2.5, unmanagedTimecode],
	// Two weeks back: in sync
	[-2, 1, 7.5, pasxNew],
	[-2, 2, 7.5, pasxMaintenance],
	[-2, 3, 4, paspNew],
	[-2, 3, 3.5, paspMaintenance],
	[-2, 4, 7.5, so],
	[-2, 5, 3, pasxNew],
	[-2, 5, 4.5, pasxMaintenance],
	// Last week: Wednesday disagrees, but is locked
	[-1, 1, 7.5, pasxNew],
	[-1, 2, 7.5, pasxNew],
	[-1, 3, 6, pasxMaintenance],
	[-1, 4, 7.5, so],
	[-1, 5, 7.5, paspNew],
];

export const fakeBekkEntries: WeekdayHours<{ timecodeId: number }>[] =
	bekkEntries.map(([week, weekday, hours, timecodeId]) => ({
		week,
		weekday,
		hours,
		on: { timecodeId },
	}));

const bundledRulesets = loadPolicies(policiesJson);

/**
 * Every timecode a bundled ruleset uses, named after its rule, plus the
 * unmanaged one and a few others for the timecode picker.
 */
export const fakeTimecodes: FakeTimecode[] = (() => {
	const byId = new Map<number, FakeTimecode>();
	for (const ruleset of bundledRulesets) {
		for (const rule of ruleset.rules) {
			if (byId.has(rule.timecode)) continue;
			byId.set(rule.timecode, {
				id: rule.timecode,
				code: `${rule.projectKey}-${rule.timecode % 10000}`,
				name: rule.comment
					? `${rule.projectKey} ${rule.comment}`
					: rule.projectKey,
				active: true,
			});
		}
	}
	for (const extra of [
		{ id: unmanagedTimecode, code: "INT-1", name: "Intern tid", active: true },
		{ id: 1000002, code: "INT-2", name: "Ferie", active: true },
		{ id: 1000003, code: "INT-3", name: "Gammelt prosjekt", active: false },
	]) {
		byId.set(extra.id, extra);
	}
	return [...byId.values()];
})();

const projectNames: Record<string, string> = {
	PASX: "PAS eksamen",
	PASP: "PAS prøver",
	SO: "Systemoppfølging",
	INTERN: "Intern",
};

/** Jira projects: every project a bundled ruleset or fake issue refers to. */
export const fakeProjects: { key: string; name: string }[] = [
	...new Set([
		...bundledRulesets.flatMap((r) => r.rules.map((rule) => rule.projectKey)),
		...fakeIssues.map((i) => i.projectKey),
	]),
]
	.sort()
	.map((key) => ({ key, name: projectNames[key] ?? `Prosjekt ${key}` }));

/** The local ruleset the `local-ruleset` scenario saves and selects. */
export const fakeLocalRuleset: Ruleset = {
	id: "demo-lokal" as RulesetId,
	name: "Mine demoregler",
	description: "Lokalt regelsett fra scenarioet local-ruleset",
	rules: [
		{
			projectKey: "PASX" as JiraProjectKey,
			timecode: pasxNew as BekkId,
			comment: "Alt på PASX",
		},
		{ projectKey: "PASP" as JiraProjectKey, timecode: paspNew as BekkId },
		{ projectKey: "SO" as JiraProjectKey, timecode: so as BekkId },
		{
			projectKey: "INTERN" as JiraProjectKey,
			timecode: unmanagedTimecode as BekkId,
			comment: "Fagdager",
		},
	],
};
