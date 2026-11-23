/**
 * PROTOTYPE, throw away. Variant B "Statusrutenett": the same grid, but every
 * cell says its state (empty, synced, will change, locked), a status strip
 * sits above it and the sync actions live in a sticky bar at the bottom.
 */
import React, { useState } from "react";
import { Alert, Button, Paragraph, Tag } from "@digdir/designsystemet-react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckmarkIcon,
	EyeIcon,
	PadlockLockedIcon,
	PadlockUnlockedIcon,
} from "@navikt/aksel-icons";
import { useRuleSet } from "../../data/useRuleset";
import { formatHours, IsoDate, IsoWeek } from "../../date-time/IsoWeek";
import { DayList } from "../TimeTable/DayList";
import { toGridEntries, type GridEntry } from "../TimeTable/gridModel";
import { TimecodeName } from "../TimeTable/TimecodeName";
import {
	AppBar,
	dayOfMonth,
	type DaySummary,
	PreviewDialog,
	today,
	usePrototypeWeek,
	useWeekView,
	weekdayShort,
	weekRange,
	type WeekView,
} from "./shared";
import styles from "./VariantB.module.css";

export const VariantB: React.FC = () => {
	const { selectedRuleset } = useRuleSet();
	const { week, ready, next, previous } = usePrototypeWeek();
	return (
		<div className={styles.page}>
			<AppBar />
			<main className={styles.main}>
				<WeekHeader week={week} next={next} previous={previous} />
				{selectedRuleset && ready && (
					<Week
						key={`${week}-${selectedRuleset.id}`}
						week={week}
						ruleset={selectedRuleset}
					/>
				)}
			</main>
		</div>
	);
};

const WeekHeader: React.FC<{
	week: IsoWeek;
	next: () => void;
	previous: () => void;
}> = ({ week, next, previous }) => {
	const { week: number, year } = IsoWeek.toParts(week);
	return (
		<div className={styles.weekHeader}>
			<div>
				<div className={styles.weekHeader__eyebrow}>{year}</div>
				<h1 className={styles.weekHeader__title}>
					Uke {number}
					<span className={styles.weekHeader__range}>{weekRange(week)}</span>
				</h1>
			</div>
			<nav aria-label="Uke" className={styles.weekHeader__nav}>
				<Button
					variant="secondary"
					icon
					aria-label="Forrige uke"
					onClick={previous}
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
				<Button variant="secondary" icon aria-label="Neste uke" onClick={next}>
					<ArrowRightIcon aria-hidden />
				</Button>
			</nav>
		</div>
	);
};

const Week: React.FC<{
	week: IsoWeek;
	ruleset: NonNullable<ReturnType<typeof useRuleSet>["selectedRuleset"]>;
}> = ({ week, ruleset }) => {
	const view = useWeekView(week, ruleset);
	const [previewOpen, setPreviewOpen] = useState(false);

	if (view.error)
		return (
			<Alert data-color="danger">En feil oppstod: {view.error.message}</Alert>
		);

	return (
		<>
			<StatusStrip view={view} />
			<div className={styles.card}>
				{view.data && view.days ? (
					<Grid
						entries={toGridEntries(view.data)}
						days={view.days}
						onLock={view.lock}
					/>
				) : (
					<div className={styles.loading}>Henter timer…</div>
				)}
				{view.data && (
					<DayList
						className={styles.narrowList}
						reports={view.data}
						onLockDate={view.lock}
					/>
				)}
			</div>
			{view.sync.isError && (
				<Alert data-color="danger">
					Synkronisering feilet: {view.sync.error.message}
				</Alert>
			)}
			{view.updateLockDate.isError && (
				<Alert data-color="danger">
					Kunne ikke låse: {view.updateLockDate.error.message}
				</Alert>
			)}
			<ActionBar view={view} onPreview={() => setPreviewOpen(true)} />
			<PreviewDialog
				view={view}
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
			/>
		</>
	);
};

const StatusStrip: React.FC<{ view: WeekView }> = ({ view }) => {
	if (!view.days) return <div className={styles.status} />;
	const toSync = view.days.filter((d) => d.changes > 0).length;
	const ok = view.days.filter((d) => d.status === "ok").length;
	const total = view.days.reduce((s, d) => s + d.bekkHours, 0);
	return (
		<div className={styles.status}>
			<span className={styles.status__total}>
				<strong>{formatHours(total)}</strong> timer ført
			</span>
			{toSync > 0 && (
				<Tag data-color="warning">
					{toSync} {toSync === 1 ? "dag" : "dager"} å synke
				</Tag>
			)}
			{ok > 0 && <Tag data-color="success">{ok} i synk</Tag>}
			{view.unmatchedCount > 0 && (
				<Tag data-color="danger">
					{view.unmatchedCount} Jira-føring uten regel
				</Tag>
			)}
			{view.lockedDays.length > 0 && (
				<Tag data-color="neutral">
					{view.lockedDays.length} låst dag avviker
				</Tag>
			)}
		</div>
	);
};

export const Grid: React.FC<{
	entries: GridEntry[];
	days: DaySummary[];
	onLock: (day: IsoDate) => void;
}> = ({ entries, days, onLock }) => {
	const sorted = [...entries].sort(
		(a, b) => Number(b.managed) - Number(a.managed),
	);
	const now = today();
	const colClass = (day: DaySummary) =>
		[
			styles.grid__col,
			IsoDate.weekday(day.date) >= 6 ? styles["grid__col--weekend"] : "",
			day.locked ? styles["grid__col--locked"] : "",
			day.date === now ? styles["grid__col--today"] : "",
		]
			.filter(Boolean)
			.join(" ");

	return (
		<table className={styles.grid}>
			<thead>
				<tr>
					<th className={styles.grid__codeHead}>Timekode</th>
					{days.map((day) => (
						<th key={day.date} className={colClass(day)}>
							<div className={styles.grid__dayHead}>
								<span className={styles.grid__weekday}>
									{weekdayShort(day.date)}
								</span>
								<span className={styles.grid__date}>
									{dayOfMonth(day.date)}
								</span>
								<LockToggle day={day} onLock={onLock} />
							</div>
						</th>
					))}
					<th className={styles.grid__sumHead}>Sum</th>
				</tr>
			</thead>
			<tbody>
				{sorted.map((entry) => (
					<tr
						key={entry.id}
						className={entry.managed ? "" : styles["grid__row--unmanaged"]}
					>
						<th scope="row" className={styles.grid__code}>
							<TimecodeName id={entry.id} />
						</th>
						{days.map((day) => (
							<td key={day.date} className={colClass(day)}>
								<Cell entry={entry} day={day} />
							</td>
						))}
						<td className={styles.grid__sum}>
							{formatHours(
								Object.values(entry.days).reduce(
									(s, d) => s + (d?.bekkHours ?? 0),
									0,
								),
							)}
						</td>
					</tr>
				))}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" className={styles.grid__code}>
						Totalt
					</th>
					{days.map((day) => (
						<td
							key={day.date}
							className={`${colClass(day)} ${styles.grid__total}`}
						>
							<DayDot day={day} />
							{formatHours(day.bekkHours)}
						</td>
					))}
					<td className={`${styles.grid__sum} ${styles.grid__total}`}>
						{formatHours(days.reduce((s, d) => s + d.bekkHours, 0))}
					</td>
				</tr>
			</tfoot>
		</table>
	);
};

const LockToggle: React.FC<{
	day: DaySummary;
	onLock: (d: IsoDate) => void;
}> = ({ day, onLock }) => (
	<button
		type="button"
		className={styles.grid__lock}
		disabled={day.locked}
		title={
			day.locked
				? `${IsoDate.formatLong(day.date)} er låst`
				: `Lås timer til og med ${IsoDate.formatLong(day.date)}`
		}
		onClick={() => onLock(day.date)}
	>
		{day.locked ? (
			<PadlockLockedIcon aria-hidden />
		) : (
			<PadlockUnlockedIcon aria-hidden />
		)}
	</button>
);

const DayDot: React.FC<{ day: DaySummary }> = ({ day }) => (
	<span
		className={`${styles.dot} ${styles[`dot--${day.status}`]}`}
		title={day.status}
		aria-hidden
	/>
);

const Cell: React.FC<{ entry: GridEntry; day: DaySummary }> = ({
	entry,
	day,
}) => {
	const hours = entry.days[day.date];
	const bekk = hours?.bekkHours ?? 0;
	const jira = hours?.totalJiraHours ?? 0;
	if (bekk === 0 && jira === 0)
		return <span className={styles.cell__empty}>·</span>;
	if (!entry.managed)
		return (
			<span
				className={`${styles.cell} ${styles["cell--unmanaged"]}`}
				title="Ikke styrt av reglene"
			>
				{formatHours(bekk)}
			</span>
		);
	if (bekk === jira)
		return (
			<span
				className={`${styles.cell} ${styles["cell--ok"]}`}
				title={`Timekeeper og Jira: ${formatHours(bekk)}`}
			>
				{formatHours(bekk)}
				<CheckmarkIcon className={styles.cell__check} aria-hidden />
			</span>
		);
	return (
		<span
			className={`${styles.cell} ${day.locked ? styles["cell--lockedMismatch"] : styles["cell--change"]}`}
			title={`Timekeeper: ${formatHours(bekk)}, Jira: ${formatHours(jira)}`}
		>
			<span className={styles.cell__from}>{formatHours(bekk)}</span>
			<span className={styles.cell__to}>{formatHours(jira)}</span>
		</span>
	);
};

export const ActionBar: React.FC<{ view: WeekView; onPreview: () => void }> = ({
	view,
	onPreview,
}) => {
	if (!view.data) return null;
	const n = view.changes.length;
	return (
		<div className={styles.actionBar}>
			<div className={styles.actionBar__inner}>
				{n > 0 ? (
					<>
						<Paragraph className={styles.actionBar__text}>
							<strong>{n} endringer</strong> klare til Timekeeper
						</Paragraph>
						<div className={styles.actionBar__buttons}>
							<Button
								variant="tertiary"
								disabled={view.busy}
								onClick={onPreview}
							>
								<EyeIcon aria-hidden />
								Forhåndsvis
							</Button>
							<Button
								loading={view.busy}
								disabled={view.busy}
								onClick={() => void view.runSync()}
							>
								Synkroniser {n} endringer
							</Button>
						</div>
					</>
				) : (
					<Paragraph className={styles.actionBar__text}>
						<CheckmarkIcon aria-hidden className={styles.actionBar__ok} />
						{view.justSynced
							? "Timene ble oppdatert!"
							: "Alt stemmer for denne uka"}
					</Paragraph>
				)}
			</div>
		</div>
	);
};
