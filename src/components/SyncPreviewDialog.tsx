import React from "react";
import type { LockDate } from "../reconciliation/entities";
import {
	Button,
	Dialog,
	Heading,
	Paragraph,
} from "@digdir/designsystemet-react";
import { formatHours, IsoDate } from "../date-time/IsoWeek";
import { groupChangesByDate } from "../reconciliation/syncPreview";
import { TimecodeLabel } from "./TimecodeLabel";
import { lockedDaysNotice } from "./syncMessages";
import type { SyncPreview } from "./useWeekSync";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import styles from "./SyncPreviewDialog.module.css";

interface Props {
	/** Open while set. */
	preview: SyncPreview | null;
	lockDate: LockDate;
	syncing: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

/** The changes a sync would make, to confirm before making them. */
export const SyncPreviewDialog: React.FC<Props> = ({
	preview,
	lockDate,
	syncing,
	onConfirm,
	onClose,
}) => (
	<Dialog
		open={preview !== null}
		onClose={onClose}
		closedby={syncing ? "none" : "any"}
		closeButton={syncing ? false : undefined}
	>
		{preview && (
			<Column>
				<Heading level={2} data-size="sm">
					Forslag til synkronisering
				</Heading>
				<Paragraph>
					Oppdaterer følgende Bekk-timer til å stemme overens med
					Jira-timeføring:
				</Paragraph>
				{groupChangesByDate(preview.changes).map(([date, dayChanges]) => (
					<section key={date} aria-label={IsoDate.formatLong(date)}>
						<Heading level={3} data-size="2xs">
							{IsoDate.formatLong(date)}
						</Heading>
						<ul className={styles.syncPreviewDialog__changes}>
							{dayChanges.map((change) => (
								<li key={change.timecodeId}>
									<TimecodeLabel timecodeId={change.timecodeId} />:{" "}
									{formatHours(change.currentHours)} →{" "}
									{formatHours(change.targetHours)} timer
								</li>
							))}
						</ul>
					</section>
				))}
				{preview.unmatchedCount > 0 && (
					<Paragraph>
						{preview.unmatchedCount} Jira-føringer uten regel blir ikke
						synkronisert.
					</Paragraph>
				)}
				{preview.lockedDays.length > 0 && (
					<Paragraph>
						{lockedDaysNotice(lockDate, preview.lockedDays)}
					</Paragraph>
				)}
				<Row>
					<Button loading={syncing} onClick={onConfirm}>
						{syncing ? "Oppdaterer timer…" : "Oppdater Bekk-timer"}
					</Button>
					<Button variant="secondary" disabled={syncing} onClick={onClose}>
						Avbryt
					</Button>
				</Row>
			</Column>
		)}
	</Dialog>
);
