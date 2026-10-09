import React, { useRef, useState } from "react";
import { Button, ConfirmModal } from "@utdanningsdirektoratet/lisa";
import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
import { useLockDate } from "../data/useLockDate";
import {
	useSyncWeek,
	useWeeklyReconciliation,
} from "../reconciliation/useWeeklyReconciliation";
import { DayReport } from "../reconciliation/entities";
import { planSync, type ProposedChange } from "../reconciliation/syncPreview";
import { Ruleset } from "../rules";
import { TimeTable } from "./TimeTable/TimeTable";
import { toGridEntries } from "./TimeTable/gridModel";

interface Props {
	week: IsoWeek;
	ruleset: Ruleset;
}

export const WeeklyReconciliation: React.FC<Props> = ({ week, ruleset }) => {
	const { data, error, isPending, dataUpdatedAt, isFetching } =
		useWeeklyReconciliation(week, ruleset);
	const { lockDate, updateLockDate } = useLockDate();
	const sync = useSyncWeek();
	const submitting = useRef(false);
	const [lockPreview, setLockPreview] = useState<IsoDate | null>(null);
	const [preview, setPreview] = useState<{
		version: string;
		changes: ProposedChange[];
		unmatchedCount: number;
	} | null>(null);
	const changes = data ? planSync(data) : [];
	const unmatchedCount =
		data?.reduce((count, day) => count + day.unmatchedJiraWork.length, 0) ??
		0;
	const version = JSON.stringify([
		week,
		ruleset.id,
		ruleset.rules,
		dataUpdatedAt,
	]);
	const openPreview =
		preview?.version === version && !isFetching && !isPending && !error;
	const closePreview = () => {
		if (!submitting.current) setPreview(null);
	};
	const confirm = async () => {
		if (!openPreview || !preview || submitting.current)
			return;
		submitting.current = true;
		try {
			await sync.mutateAsync(preview.changes);
		} catch {
			// The mutation exposes the failed date/timecode and count of completed writes.
		} finally {
			submitting.current = false;
			setPreview(null);
		}
	};

	const weekDays = data?.map((r) => r.date) ?? [];
	const weekStart = weekDays[0];
	const coveredNeedingReview =
		lockPreview && data
			? data.filter((r) => r.date <= lockPreview && !DayReport.isInSync(r))
			: [];
	const hasGapBeforeWeek =
		lockPreview !== null &&
		weekStart !== undefined &&
		(lockDate === undefined || IsoDate.addDays(lockDate, 1) < weekStart);

	const confirmLock = async () => {
		if (!lockPreview) return;
		try {
			await updateLockDate.mutateAsync(lockPreview);
		} finally {
			setLockPreview(null);
		}
	};

	return (
		<section aria-label="Avstemming">
			{isPending ? (
				<p>Henter timer fra Jira og internt system…</p>
			) : error ? (
				<p role="alert">Kunne ikke avstemme uken: {error.message}</p>
			) : (
				data && (
					<>
						<TimeTable
							entries={toGridEntries(data)}
							days={data.map((report) => report.date)}
							onLockDate={setLockPreview}
						/>
						{unmatchedCount > 0 && (
							<p role="status">
								{unmatchedCount} Jira-føringer mangler regel og må gjennomgås. De er
								ikke med i synkroniseringen.
							</p>
						)}
						<p>
							{data.every(DayReport.isInSync)
								? "Alle dager stemmer."
								: "Uken trenger gjennomgang."}
						</p>
						{changes.length > 0 && (
							<Button
								disabled={isFetching || sync.isPending}
								onClick={() => {
									sync.reset();
									setPreview({ version, changes, unmatchedCount });
								}}
							>
								Vis synkroniseringsforslag
							</Button>
						)}
					</>
				)
			)}
			{sync.isError && (
				<p role="alert">Synkronisering feilet: {sync.error.message}</p>
			)}
			{sync.isSuccess && (
				<p role="status">Timene ble oppdatert. Avstemmingen oppdateres.</p>
			)}
			{updateLockDate.isError && (
				<p role="alert">Kunne ikke låse: {updateLockDate.error.message}</p>
			)}
			{updateLockDate.isSuccess && (
				<p role="status">Timer ble låst.</p>
			)}
			<ConfirmModal
				showModal={Boolean(openPreview)}
				onCancel={closePreview}
				title="Forslag til synkronisering"
				confirmLabel="Oppdater interne timer"
				cancelLabel="Avbryt"
				confirmButtonDisabled={sync.isPending}
				onConfirm={() => {
					void confirm();
				}}
			>
				{preview && (
					<>
						<p>Jira-timene blir målet for disse endringene i internt system:</p>
						<ul>
							{preview.changes.map((change) => (
								<li key={`${change.date}-${change.timecodeId}`}>
									{change.date}, timekode {change.timecodeId}: {change.currentHours} → {change.targetHours} timer
								</li>
							))}
						</ul>
						{preview.unmatchedCount > 0 && (
							<p>
								{preview.unmatchedCount} Jira-føringer uten regel blir ikke synkronisert.
							</p>
						)}
						{lockDate === undefined && (
							<p>
								Låsedato er ukjent. Internt system avgjør om endringene kan utføres.
							</p>
						)}
						{lockDate && preview.changes.some((change) => change.date <= lockDate) && (
							<p>
								Noen dager er låst. Internt system avgjør om endringene kan utføres.
							</p>
						)}
						{sync.isPending && <p>Oppdaterer timer…</p>}
					</>
				)}
			</ConfirmModal>
			<ConfirmModal
				showModal={lockPreview !== null}
				onCancel={() => {
					if (!updateLockDate.isPending) setLockPreview(null);
				}}
				title="Lås timer"
				confirmLabel={`Lås til ${lockPreview}`}
				cancelLabel="Avbryt"
				confirmButtonDisabled={updateLockDate.isPending}
				onConfirm={() => {
					void confirmLock();
				}}
			>
				<p>Timer i internt system låses frem til og med {lockPreview}.</p>
				{coveredNeedingReview.length > 0 && (
					<p>
						{coveredNeedingReview.length === 1
							? "1 dag som låses trenger gjennomgang."
							: `${coveredNeedingReview.length} dager som låses trenger gjennomgang.`}
					</p>
				)}
				{hasGapBeforeWeek && (
					<p>Datoer før denne uken er ikke vist, men låses også.</p>
				)}
				{updateLockDate.isPending && <p>Låser timer…</p>}
			</ConfirmModal>
		</section>
	);
};
