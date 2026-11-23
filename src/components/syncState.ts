/** What the status card's right-hand side shows. */
export type SyncState =
	| { kind: "loading" }
	| { kind: "error" }
	| { kind: "changes"; count: number; busy: boolean }
	| { kind: "synced" }
	| { kind: "inSync" }
	/** Nothing to sync, but not all is well: locked days or unmatched worklogs. */
	| { kind: "nothingToSync" };

export interface SyncStateInput {
	isPending: boolean;
	hasError: boolean;
	changeCount: number;
	/** A refetch or sync is running. */
	busy: boolean;
	/** The data on screen is the refetch that followed a successful sync. */
	justSynced: boolean;
	lockedDayCount: number;
	unmatchedCount: number;
}

/** Earlier checks win: pending data beats an error, pending changes beat a past sync. */
export const toSyncState = ({
	isPending,
	hasError,
	changeCount,
	busy,
	justSynced,
	lockedDayCount,
	unmatchedCount,
}: SyncStateInput): SyncState => {
	if (isPending) return { kind: "loading" };
	if (hasError) return { kind: "error" };
	if (changeCount > 0) return { kind: "changes", count: changeCount, busy };
	if (justSynced) return { kind: "synced" };
	if (lockedDayCount === 0 && unmatchedCount === 0) return { kind: "inSync" };
	return { kind: "nothingToSync" };
};
