import { describe, expect, test } from "vitest";
import {
	toSyncState,
	type SyncStateInput,
} from "../../src/components/syncState";

const settled: SyncStateInput = {
	isPending: false,
	hasError: false,
	changeCount: 0,
	busy: false,
	justSynced: false,
	lockedDayCount: 0,
	unmatchedCount: 0,
};

describe("toSyncState", () => {
	test("loading while the data is pending, even with an error", () => {
		expect(
			toSyncState({ ...settled, isPending: true, hasError: true }),
		).toEqual({ kind: "loading" });
	});

	test("error once the data has failed", () => {
		expect(toSyncState({ ...settled, hasError: true, changeCount: 2 })).toEqual(
			{ kind: "error" },
		);
	});

	test("changes carry the count and busy flag, and beat a past sync", () => {
		expect(
			toSyncState({ ...settled, changeCount: 3, busy: true, justSynced: true }),
		).toEqual({ kind: "changes", count: 3, busy: true });
	});

	test("synced right after a sync left nothing to change", () => {
		expect(
			toSyncState({ ...settled, justSynced: true, unmatchedCount: 1 }),
		).toEqual({ kind: "synced" });
	});

	test("in sync when nothing is left over", () => {
		expect(toSyncState(settled)).toEqual({ kind: "inSync" });
	});

	test("nothing to sync when locked days or unmatched worklogs remain", () => {
		expect(toSyncState({ ...settled, lockedDayCount: 1 })).toEqual({
			kind: "nothingToSync",
		});
		expect(toSyncState({ ...settled, unmatchedCount: 2 })).toEqual({
			kind: "nothingToSync",
		});
	});
});
