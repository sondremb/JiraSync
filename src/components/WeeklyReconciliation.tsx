import React, { useRef } from "react";
import { Alert } from "@digdir/designsystemet-react";
import { IsoWeek } from "../date-time/IsoWeek";
import { LockDate } from "../reconciliation/entities";
import { Ruleset } from "../rules";
import { toWeekStatus } from "./TimeTable/weekStatus";
import { StatusCard } from "./StatusCard";
import { WeekGrid } from "./WeekGrid";
import { ReconciliationAlerts } from "./ReconciliationAlerts";
import { StickySyncBar } from "./StickySyncBar";
import { SyncPreviewDialog } from "./SyncPreviewDialog";
import { useWeekSync } from "./useWeekSync";
import { useOnScreen } from "../Utils/useOnScreen";
import { OvertimeDialog } from "./OvertimeDialog";
import { useLockFlow } from "./useLockFlow";
import styles from "./WeeklyReconciliation.module.css";

interface WeekNavigation {
	week: IsoWeek;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
}

interface Props extends WeekNavigation {
	ruleset: Ruleset;
}

export const WeeklyReconciliation: React.FC<Props> = ({
	week,
	ruleset,
	onPreviousWeek,
	onNextWeek,
}) => {
	const lockFlow = useLockFlow(week);
	const { lockDate } = lockFlow;
	const weekSync = useWeekSync(week, ruleset, lockDate);
	const { data, error } = weekSync;
	const status = data ? toWeekStatus(data, lockDate) : undefined;

	const cardRef = useRef<HTMLElement>(null);
	const cardOnScreen = useOnScreen(cardRef);

	return (
		<section aria-label="Avstemming" className={styles.weeklyReconciliation}>
			<StatusCard
				ref={cardRef}
				week={week}
				status={status}
				sync={weekSync.syncState}
				onPreviousWeek={onPreviousWeek}
				onNextWeek={onNextWeek}
				onSync={weekSync.syncNow}
				onPreview={weekSync.showPreview}
			/>
			{error ? (
				<Alert data-color="danger">En feil oppstod: {error.message}</Alert>
			) : (
				<WeekGrid
					week={week}
					reports={data}
					lockDate={lockDate}
					status={status}
					onLockDate={lockFlow.lock}
				/>
			)}
			<ReconciliationAlerts
				lockDate={lockDate}
				lockedDays={weekSync.lockedDays}
				syncError={weekSync.syncError}
				lockError={lockFlow.gridError}
				locked={lockFlow.locked}
				refusedUntil={lockFlow.refusedUntil}
			/>
			{!cardOnScreen && (
				<StickySyncBar
					sync={weekSync.syncState}
					onSync={weekSync.syncNow}
					onPreview={weekSync.showPreview}
				/>
			)}
			<SyncPreviewDialog
				preview={weekSync.preview}
				lockDate={lockDate}
				syncing={weekSync.syncing}
				onConfirm={weekSync.confirmPreview}
				onClose={weekSync.closePreview}
			/>
			<OvertimeDialog
				month={lockFlow.signingMonth}
				locking={lockFlow.locking}
				lockError={lockFlow.dialogError}
				onConfirm={lockFlow.confirmSigning}
				onClose={lockFlow.closeSigning}
			/>
		</section>
	);
};

/** The week while the lock date (and so the first week to show) is loading. */
export const WeeklyReconciliationPending: React.FC<WeekNavigation> = ({
	week,
	onPreviousWeek,
	onNextWeek,
}) => (
	<section aria-label="Avstemming" className={styles.weeklyReconciliation}>
		<StatusCard
			week={week}
			sync={{ kind: "loading" }}
			onPreviousWeek={onPreviousWeek}
			onNextWeek={onNextWeek}
		/>
		<WeekGrid week={week} reports={undefined} lockDate={LockDate.unknown} />
	</section>
);
