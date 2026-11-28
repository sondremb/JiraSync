import React from "react";
import type { LockDate } from "../reconciliation/entities";
import { Alert, Heading, Paragraph } from "@digdir/designsystemet-react";
import { IsoDate } from "../date-time/IsoWeek";
import { lockedDaysNotice } from "./syncMessages";
import { oneMonthAtATimeNotice } from "./lockMessages";

interface Props {
	lockDate: LockDate;
	/** Days that differ from Jira but are locked, so are not synced. */
	lockedDays: readonly IsoDate[];
	syncError: Error | null;
	lockError: Error | null;
	locked: boolean;
	/** The first month end, when a lock across several was refused. */
	refusedUntil: IsoDate | null;
}

/** The notices below the grid: locked days, and how syncing and locking went. */
export const ReconciliationAlerts: React.FC<Props> = ({
	lockDate,
	lockedDays,
	syncError,
	lockError,
	locked,
	refusedUntil,
}) => (
	<>
		{lockedDays.length > 0 && (
			<Alert data-color="warning">
				{lockedDaysNotice(lockDate, lockedDays)}
			</Alert>
		)}
		{syncError && (
			<Alert data-color="danger">
				<Heading level={2} data-size="xs">
					Synkronisering feilet
				</Heading>
				<Paragraph>{syncError.message}</Paragraph>
			</Alert>
		)}
		{lockError && (
			<Alert data-color="danger">Kunne ikke låse: {lockError.message}</Alert>
		)}
		{refusedUntil && (
			<Alert data-color="warning">{oneMonthAtATimeNotice(refusedUntil)}</Alert>
		)}
		{locked && <Alert data-color="success">Timer ble låst.</Alert>}
	</>
);
