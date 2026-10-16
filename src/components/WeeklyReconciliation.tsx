import React, { useRef, useState } from "react";
import {
	Alert,
	Button,
	ConfirmModal,
	FlexRow,
	H2,
	useNotification,
} from "@utdanningsdirektoratet/lisa";
import { formatHours, IsoDate, IsoWeek } from "../date-time/IsoWeek";
import { TimecodeLabel } from "./TimecodeLabel";
import { useLockDate } from "../data/useLockDate";
import {
	useSyncWeek,
	useWeeklyReconciliation,
} from "../reconciliation/useWeeklyReconciliation";
import { planSync, type ProposedChange } from "../reconciliation/syncPreview";
import { Ruleset } from "../rules";
import { TimeTable } from "./TimeTable/TimeTable";
import { toGridEntries } from "./TimeTable/gridModel";
import { P } from "./P";

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

export const WeeklyReconciliation: React.FC<Props> = ({ week, ruleset }) => {
	const { data, error, isPending, dataUpdatedAt, isFetching } =
		useWeeklyReconciliation(week, ruleset);
	const { lockDate, updateLockDate } = useLockDate();
	const sync = useSyncWeek();
	const notify = useNotification();
	const submitting = useRef(false);
	const [preview, setPreview] = useState<{
		version: string;
		changes: ProposedChange[];
		unmatchedCount: number;
	} | null>(null);
	const changes = data ? planSync(data) : [];
	const unmatchedCount =
		data?.reduce((count, day) => count + day.unmatchedJiraWork.length, 0) ?? 0;
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
	const runSync = async (toApply: ProposedChange[]) => {
		if (submitting.current) return;
		submitting.current = true;
		try {
			await sync.mutateAsync(toApply);
			notify({
				type: "success",
				content: "Timene ble oppdatert!",
			});
		} catch (error) {
			notify({
				type: "error",
				title: "Synkronisering feilet",
				content: error instanceof Error ? error.message : String(error),
				closeable: true,
			});
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
		<section aria-label="Avstemming">
			{isPending ? (
				<TimeTable pending entries={[]} days={IsoWeek.days(week)} />
			) : error ? (
				<p role="alert">En feil oppstod: {error.message}</p>
			) : (
				data && (
					<>
						<TimeTable
							entries={toGridEntries(data)}
							days={data.map((report) => report.date)}
							onLockDate={lock}
						/>
						{unmatchedCount > 0 && (
							<p role="status">
								{unmatchedCount} Jira-føringer mangler regel og må gjennomgås.
								De er ikke med i synkroniseringen.
							</p>
						)}
						{changes.length > 0 ? (
							<FlexRow gap={12} className="mt-20" halign="center">
								<Button
									pending={isFetching || sync.isPending}
									onClick={() => {
										void runSync(changes);
									}}
								>
									Synkroniser
								</Button>
								<Button
									variant="outlined"
									icon="eye"
									disabled={isFetching || sync.isPending}
									onClick={() => {
										setPreview({ version, changes, unmatchedCount });
									}}
								>
									Forhåndsvis
								</Button>
							</FlexRow>
						) : (
							<FlexRow halign="center" className="mt-20">
								<Alert type="success">Alt stemmer!</Alert>
							</FlexRow>
						)}
					</>
				)
			)}
			{updateLockDate.isError && (
				<p role="alert">Kunne ikke låse: {updateLockDate.error.message}</p>
			)}
			{updateLockDate.isSuccess && <p role="status">Timer ble låst.</p>}
			<ConfirmModal
				showModal={Boolean(openPreview)}
				onCancel={closePreview}
				title="Forslag til synkronisering"
				confirmLabel="Oppdater Bekk-timer"
				cancelLabel="Avbryt"
				confirmButtonDisabled={sync.isPending}
				onConfirm={() => {
					void confirm();
				}}
			>
				{preview && (
					<>
						<P className="mt-20">
							Oppdaterer følgende Bekk-timer til å stemme overens med
							Jira-timeføring:
						</P>
						{groupByDate(preview.changes).map(([date, dayChanges]) => (
							<section key={date} aria-label={IsoDate.formatLong(date)}>
								<H2 textStyle="title" clasName="mb-12">
									{IsoDate.formatLong(date)}
								</H2>
								<ul className="mt-0 mb-20">
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
							<p>
								{preview.unmatchedCount} Jira-føringer uten regel blir ikke
								synkronisert.
							</p>
						)}
						{lockDate === undefined && (
							<p>
								Låsedato er ukjent. Internt system avgjør om endringene kan
								utføres.
							</p>
						)}
						{lockDate &&
							preview.changes.some((change) => change.date <= lockDate) && (
								<p>
									Noen dager er låst. Internt system avgjør om endringene kan
									utføres.
								</p>
							)}
						{sync.isPending && <p>Oppdaterer timer…</p>}
					</>
				)}
			</ConfirmModal>
		</section>
	);
};
