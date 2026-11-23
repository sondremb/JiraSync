import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
import {
	reconciliationQueryKey,
	useSyncWeek,
	useWeeklyReconciliation,
} from "../reconciliation/useWeeklyReconciliation";
import {
	lockedOutOfSyncDays,
	planSync,
	type ProposedChange,
} from "../reconciliation/syncPreview";
import { Ruleset } from "../rules";
import { toSyncState } from "./syncState";

/** What the preview dialog shows: the plan as it was when it was opened. */
export interface SyncPreview {
	changes: ProposedChange[];
	unmatchedCount: number;
	lockedDays: IsoDate[];
}

/**
 * The week's reconciliation and everything needed to sync it: the planned
 * changes, the status card's state, and the preview dialog.
 */
export const useWeekSync = (
	week: IsoWeek,
	ruleset: Ruleset,
	lockDate: IsoDate | undefined,
) => {
	const { data, error, isPending, dataUpdatedAt, isFetching } =
		useWeeklyReconciliation(week, ruleset);
	const sync = useSyncWeek();
	const queryClient = useQueryClient();
	const submitting = useRef(false);
	/**
	 * `dataUpdatedAt` of the refetch that follows a successful sync. The success
	 * message only shows for that data, so a later refetch, week or ruleset
	 * change replaces it with the current state.
	 */
	const [syncedAt, setSyncedAt] = useState<number | null>(null);
	const [preview, setPreview] = useState<
		(SyncPreview & { version: string }) | null
	>(null);

	const changes = data ? planSync(data, lockDate) : [];
	const lockedDays = data ? lockedOutOfSyncDays(data, lockDate) : [];
	const unmatchedCount =
		data?.reduce((count, day) => count + day.unmatchedJiraWork.length, 0) ?? 0;
	/** The preview only stays open while the data it was planned from is current. */
	const version = JSON.stringify([
		week,
		ruleset.id,
		ruleset.rules,
		dataUpdatedAt,
		lockDate,
	]);
	const previewOpen =
		preview?.version === version && !isFetching && !isPending && !error;

	const syncState = toSyncState({
		isPending,
		hasError: Boolean(error),
		changeCount: changes.length,
		busy: isFetching || sync.isPending,
		justSynced: syncedAt !== null && syncedAt === dataUpdatedAt,
		lockedDayCount: lockedDays.length,
		unmatchedCount,
	});

	const runSync = async (toApply: ProposedChange[]) => {
		if (submitting.current) return;
		submitting.current = true;
		try {
			await sync.mutateAsync(toApply);
			// The mutation awaits the invalidation, so this is the refetched data.
			setSyncedAt(
				queryClient.getQueryState(reconciliationQueryKey(week, ruleset))
					?.dataUpdatedAt ?? null,
			);
		} catch {
			// Exposed as `syncError`.
		} finally {
			submitting.current = false;
			setPreview(null);
		}
	};

	return {
		data,
		error,
		isPending,
		lockedDays,
		syncState,
		syncing: sync.isPending,
		syncError: sync.error,
		/** Applies the current plan. */
		syncNow: () => {
			void runSync(changes);
		},
		/** The preview, while its dialog is open. */
		preview: previewOpen ? preview : null,
		showPreview: () =>
			setPreview({ version, changes, unmatchedCount, lockedDays }),
		closePreview: () => {
			if (!submitting.current) setPreview(null);
		},
		/** Applies the plan the preview shows. */
		confirmPreview: () => {
			if (previewOpen && preview) void runSync(preview.changes);
		},
	};
};
