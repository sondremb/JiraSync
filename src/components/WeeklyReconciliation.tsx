import React, { useRef, useState } from "react";
import {
	Alert,
	Button,
	Dialog,
	Heading,
	Paragraph,
} from "@digdir/designsystemet-react";
import { EyeIcon } from "@navikt/aksel-icons";
import { useQueryClient } from "@tanstack/react-query";
import { formatHours, IsoDate, IsoWeek } from "../date-time/IsoWeek";
import { TimecodeLabel } from "./TimecodeLabel";
import { useLockDate } from "../data/useLockDate";
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
import { TimeTable } from "./TimeTable/TimeTable";
import { DayList } from "./TimeTable/DayList";
import { toGridEntries } from "./TimeTable/gridModel";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import styles from "./WeeklyReconciliation.module.css";

interface Props {
	week: IsoWeek;
	ruleset: Ruleset;
}

const groupByDate = (
	changes: readonly ProposedChange[],
): [IsoDate, ProposedChange[]][] => {
	const groups = new Map<IsoDate, ProposedChange[]>();
	for (const change of changes) {
		groups.set(change.date, [...(groups.get(change.date) ?? []), change]);
	}
	return Array.from(groups);
};

const lockedDaysNotice = (
	lockDate: IsoDate | undefined,
	lockedDays: readonly IsoDate[],
): string =>
	lockDate === undefined
		? "Låsedato er ukjent, så ingen timer kan synkroniseres."
		: `Låste dager stemmer ikke med Jira og blir ikke synkronisert: ${lockedDays.map(IsoDate.formatLong).join(", ")}.`;

export const WeeklyReconciliation: React.FC<Props> = ({ week, ruleset }) => {
	const { data, error, isPending, dataUpdatedAt, isFetching } =
		useWeeklyReconciliation(week, ruleset);
	const { lockDate, updateLockDate } = useLockDate();
	const sync = useSyncWeek();
	const queryClient = useQueryClient();
	const submitting = useRef(false);
	/**
	 * `dataUpdatedAt` of the refetch that follows a successful sync. The success
	 * message only shows for that data, so a later refetch, week or ruleset
	 * change replaces it with the current state.
	 */
	const [syncedAt, setSyncedAt] = useState<number | null>(null);
	const justSynced = syncedAt !== null && syncedAt === dataUpdatedAt;
	const [preview, setPreview] = useState<{
		version: string;
		changes: ProposedChange[];
		unmatchedCount: number;
		lockedDays: IsoDate[];
	} | null>(null);
	const changes = data ? planSync(data, lockDate) : [];
	const lockedDays = data ? lockedOutOfSyncDays(data, lockDate) : [];
	const unmatchedCount =
		data?.reduce((count, day) => count + day.unmatchedJiraWork.length, 0) ?? 0;
	const version = JSON.stringify([
		week,
		ruleset.id,
		ruleset.rules,
		dataUpdatedAt,
		lockDate,
	]);
	const openPreview =
		preview?.version === version && !isFetching && !isPending && !error;
	const closePreview = () => {
		if (!submitting.current) setPreview(null);
	};
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
			// Shown from `sync.error` below.
		} finally {
			submitting.current = false;
			setPreview(null);
		}
	};
	const confirm = async () => {
		if (!openPreview || !preview) return;
		await runSync(preview.changes);
	};

	const lock = (day: IsoDate) => {
		if (updateLockDate.isPending) return;
		updateLockDate.mutate(day);
	};

	return (
		<section aria-label="Avstemming" className={styles.weeklyReconciliation}>
			{isPending ? (
				<>
					<TimeTable
						pending
						className={styles.weeklyReconciliation__table}
						entries={[]}
						days={IsoWeek.days(week)}
					/>
					<DayList
						pending
						className={styles.weeklyReconciliation__list}
						reports={[]}
					/>
				</>
			) : error ? (
				<Alert data-color="danger">En feil oppstod: {error.message}</Alert>
			) : (
				data && (
					<>
						<TimeTable
							className={styles.weeklyReconciliation__table}
							entries={toGridEntries(data)}
							days={data.map((report) => report.date)}
							onLockDate={lock}
						/>
						<DayList
							className={styles.weeklyReconciliation__list}
							reports={data}
							onLockDate={lock}
						/>
						{unmatchedCount > 0 && (
							<Alert data-color="warning">
								{unmatchedCount} Jira-føringer mangler regel og må gjennomgås.
								De er ikke med i synkroniseringen.
							</Alert>
						)}
						{lockedDays.length > 0 && (
							<Alert data-color="warning">
								{lockedDaysNotice(lockDate, lockedDays)}
							</Alert>
						)}
						{changes.length > 0 ? (
							<Row justify="center" wrap>
								<Button
									// `loading` only shows a spinner, so block clicks while the
									// data behind `changes` may be stale.
									loading={isFetching || sync.isPending}
									disabled={isFetching || sync.isPending}
									onClick={() => {
										void runSync(changes);
									}}
								>
									Synkroniser
								</Button>
								<Button
									variant="secondary"
									disabled={isFetching || sync.isPending}
									onClick={() => {
										setPreview({
											version,
											changes,
											unmatchedCount,
											lockedDays,
										});
									}}
								>
									<EyeIcon aria-hidden />
									Forhåndsvis
								</Button>
							</Row>
						) : (
							!justSynced &&
							lockedDays.length === 0 && (
								<Alert
									data-color="success"
									className={styles["weeklyReconciliation__alert--centered"]}
								>
									Alt stemmer!
								</Alert>
							)
						)}
					</>
				)
			)}
			{justSynced && (
				<Alert
					data-color="success"
					className={styles["weeklyReconciliation__alert--centered"]}
				>
					Timene ble oppdatert!
				</Alert>
			)}
			{sync.isError && (
				<Alert data-color="danger">
					<Heading level={2} data-size="xs">
						Synkronisering feilet
					</Heading>
					<Paragraph>{sync.error.message}</Paragraph>
				</Alert>
			)}
			{updateLockDate.isError && (
				<Alert data-color="danger">
					Kunne ikke låse: {updateLockDate.error.message}
				</Alert>
			)}
			{updateLockDate.isSuccess && (
				<Alert data-color="success">Timer ble låst.</Alert>
			)}
			<Dialog
				open={Boolean(openPreview)}
				onClose={closePreview}
				closedby={sync.isPending ? "none" : "any"}
				closeButton={sync.isPending ? false : undefined}
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
						{groupByDate(preview.changes).map(([date, dayChanges]) => (
							<section key={date} aria-label={IsoDate.formatLong(date)}>
								<Heading level={3} data-size="2xs">
									{IsoDate.formatLong(date)}
								</Heading>
								<ul className={styles.weeklyReconciliation__changes}>
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
							<Button
								loading={sync.isPending}
								onClick={() => {
									void confirm();
								}}
							>
								{sync.isPending ? "Oppdaterer timer…" : "Oppdater Bekk-timer"}
							</Button>
							<Button
								variant="secondary"
								disabled={sync.isPending}
								onClick={closePreview}
							>
								Avbryt
							</Button>
						</Row>
					</Column>
				)}
			</Dialog>
		</section>
	);
};
