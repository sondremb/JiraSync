import { describe, expect, test } from "vitest";
import policiesJson from "../../src/policies/policies.json";
import { loadPolicies } from "../../src/policies/schema";
import { IsoDate, IsoMonth, IsoWeek } from "../../src/date-time/IsoWeek";
import { createFakeStore, type FakeStore } from "../../src/fake/fakeStore";
import { fixtureRulesetId } from "../../src/fake/fixtures";
import { reconcilePeriod } from "../../src/reconciliation/reconcile";
import { createJqlPolicy } from "../../src/reconciliation/implementation/jqlPolicy";
import {
	DayReport,
	type BekkTimecodeId,
	type JiraIssueId,
	LockDate,
} from "../../src/reconciliation/entities";
import {
	lockedOutOfSyncDays,
	planSync,
} from "../../src/reconciliation/syncPreview";
import { syncWeek } from "../../src/reconciliation/syncWeek";

// A Wednesday in week 2026-W47
const today = new Date("2026-11-18T10:00:00Z");
const currentWeek = IsoWeek.parse("2026-W47");
const lockedWeek = IsoWeek.parse("2026-W46");
const inSyncWeek = IsoWeek.parse("2026-W45");

const ruleset = loadPolicies(policiesJson).find(
	(r) => r.id === fixtureRulesetId,
)!;

/** What the app's Jira and Bekk loaders would see, read straight from the store. */
function reconcile(store: FakeStore, week: IsoWeek) {
	const from = IsoWeek.monday(week);
	const to = IsoWeek.sunday(week);
	return reconcilePeriod(
		from,
		to,
		async () =>
			store
				.worklogsBetween(from, to)
				.filter((log) => log.authorAccountId === store.accountId)
				.map((log) => ({
					issueId: log.issueId as JiraIssueId,
					date: log.date,
					hoursWorked: log.hours,
				})),
		async () =>
			createJqlPolicy(ruleset, async (issueIds, jqls) =>
				store.matchJqls(issueIds, jqls).map((match) => {
					expect(match.errors).toEqual([]);
					return { matchedIssues: match.matchedIssues as JiraIssueId[] };
				}),
			),
		async () =>
			store.bekkEntries(from, to).map((entry) => ({
				date: entry.date,
				timecodeId: entry.timecodeId as BekkTimecodeId,
				hoursWorked: entry.hours,
			})),
	);
}

describe("fake fixtures", () => {
	test("the lock date is last Sunday", () => {
		const store = createFakeStore({ today, scenario: "default" });
		expect(store.lockDate()).toBe(IsoWeek.sunday(lockedWeek));
	});

	test("the current week has changes, an unmatched Jira worklog and an unmanaged entry", async () => {
		const store = createFakeStore({ today, scenario: "default" });
		const reports = await reconcile(store, currentWeek);

		const changes = planSync(reports, LockDate.of(store.lockDate()));
		expect(changes.some((c) => c.currentHours === 0)).toBe(true);
		expect(changes.some((c) => c.targetHours === 0)).toBe(true);
		expect(changes.some((c) => c.currentHours > 0 && c.targetHours > 0)).toBe(
			true,
		);
		expect(reports.some((r) => r.unmatchedJiraWorklogs.length > 0)).toBe(true);
		expect(reports.some((r) => r.unmanagedEntries.length > 0)).toBe(true);
	});

	test("two weeks back is in sync", async () => {
		const store = createFakeStore({ today, scenario: "default" });
		const reports = await reconcile(store, inSyncWeek);

		expect(reports.filter((r) => r.comparisons.size > 0)).toHaveLength(5);
		expect(reports.every(DayReport.isInSync)).toBe(true);
	});

	test("last week is locked, and a locked day disagrees with Jira", async () => {
		const store = createFakeStore({ today, scenario: "default" });
		const reports = await reconcile(store, lockedWeek);

		expect(planSync(reports, LockDate.of(store.lockDate()))).toEqual([]);
		expect(
			lockedOutOfSyncDays(reports, LockDate.of(store.lockDate())),
		).not.toEqual([]);
	});

	test("nothing is locked in the no-lock-date scenario", () => {
		const store = createFakeStore({ today, scenario: "no-lock-date" });
		expect(store.lockDate()).toBeNull();
	});
});

describe("fake store writes", () => {
	test("syncing the current week puts it in sync", async () => {
		const store = createFakeStore({ today, scenario: "default" });
		const changes = planSync(
			await reconcile(store, currentWeek),
			LockDate.of(store.lockDate()),
		);

		await syncWeek(changes, async (change) => {
			expect(
				store.writeBekkHours(
					change.date,
					change.timecodeId,
					change.targetHours,
				),
			).toEqual([]);
		});

		const after = await reconcile(store, currentWeek);
		expect(planSync(after, LockDate.of(store.lockDate()))).toEqual([]);
		// Unmanaged Bekk hours are left alone
		expect(after.some((r) => r.unmanagedEntries.length > 0)).toBe(true);
	});

	test("writes on or before the lock date are rejected and change nothing", () => {
		const store = createFakeStore({ today, scenario: "default" });
		const lockDate = store.lockDate()!;
		const before = store.bekkEntries(lockDate, lockDate);

		expect(store.writeBekkHours(lockDate, 1003649, 3)).not.toEqual([]);
		expect(store.bekkEntries(lockDate, lockDate)).toEqual(before);
	});

	test("with no lock date, writes on any day are saved", () => {
		const store = createFakeStore({ today, scenario: "no-lock-date" });
		const twoWeeksAgo = IsoWeek.monday(inSyncWeek);

		expect(store.writeBekkHours(twoWeeksAgo, 1003649, 3)).toEqual([]);
		expect(store.bekkEntries(twoWeeksAgo, twoWeeksAgo)).toContainEqual({
			date: twoWeeksAgo,
			timecodeId: 1003649,
			hours: 3,
		});
	});

	test("locking hours moves the lock date", () => {
		const store = createFakeStore({ today, scenario: "default" });
		const thisSunday = IsoWeek.sunday(currentWeek);

		store.lockHours(thisSunday);

		expect(store.lockDate()).toBe(thisSunday);
		expect(
			store.writeBekkHours(IsoWeek.monday(currentWeek), 1003649, 1),
		).not.toEqual([]);
	});

	test("a lock that closes a month needs its overtime signed", () => {
		// Locked through 2026-11-15, the Sunday of week 46
		const store = createFakeStore({ today, scenario: "default" });
		const monthEnd = IsoDate.parse("2026-11-30");
		const november = IsoMonth.parse("2026-11");

		expect(store.lockHours(monthEnd)).toEqual([
			"Signering av overtid må angis når måneden låses.",
		]);
		expect(store.lockDate()).toBe(IsoWeek.sunday(lockedWeek));

		const signed = { year: 2026, month: 11, payoutHours: 6, flexHours: 3.5 };
		expect(store.lockHours(monthEnd, signed)).toEqual([]);
		expect(store.lockDate()).toBe(monthEnd);
		expect(store.overtimeSummary(november)).toMatchObject({
			allocatable: 0,
			signed,
		});
	});

	test("overtime months span the ISO weeks whose Sunday is in the month", () => {
		const store = createFakeStore({ today, scenario: "default" });
		expect(store.overtimeSummary(IsoMonth.parse("2026-11"))).toMatchObject({
			fromWeek: 44,
			toWeek: 48,
			allocatable: 7.5,
		});
		expect(store.overtimeSummary(IsoMonth.parse("2026-10"))).toMatchObject({
			fromWeek: 40,
			toWeek: 43,
		});
		expect(store.overtimeSummary(IsoMonth.parse("2026-12"))).toMatchObject({
			fromWeek: 49,
			toWeek: 52,
			halfYearClearing: { payout: 2, deletion: 0 },
		});
	});
});
