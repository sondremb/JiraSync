/**
 * PROTOTYPE, throw away. Variant C "Endringer først": leads with the answer to
 * "what do I need to do?". A hero card with the status and the sync button, a
 * strip of day tiles, the changes listed inline (the preview, always open),
 * and the full grid folded away under "Alle timer".
 */
import React from "react";
import { Alert, Button, Details, Heading } from "@digdir/designsystemet-react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckmarkCircleFillIcon,
	EyeIcon,
	ExclamationmarkTriangleFillIcon,
	PadlockLockedIcon,
	PadlockUnlockedIcon,
	XMarkOctagonFillIcon,
} from "@navikt/aksel-icons";
import { useRuleSet } from "../../data/useRuleset";
import { formatHours, IsoDate, IsoWeek } from "../../date-time/IsoWeek";
import { TimeTable } from "../TimeTable/TimeTable";
import { toGridEntries } from "../TimeTable/gridModel";
import {
	AppBar,
	ChangeList,
	dayOfMonth,
	type DaySummary,
	monthShort,
	today,
	usePrototypeWeek,
	useWeekView,
	weekdayShort,
	weekRange,
	type WeekView,
} from "./shared";
import styles from "./VariantC.module.css";

export const VariantC: React.FC = () => {
	const { selectedRuleset } = useRuleSet();
	const weekNav = usePrototypeWeek();
	return (
		<div className={styles.page}>
			<AppBar />
			<main className={styles.main}>
				{selectedRuleset && weekNav.ready && (
					<Week
						key={`${weekNav.week}-${selectedRuleset.id}`}
						weekNav={weekNav}
						ruleset={selectedRuleset}
					/>
				)}
			</main>
		</div>
	);
};

const Week: React.FC<{
	weekNav: ReturnType<typeof usePrototypeWeek>;
	ruleset: NonNullable<ReturnType<typeof useRuleSet>["selectedRuleset"]>;
}> = ({ weekNav, ruleset }) => {
	const view = useWeekView(weekNav.week, ruleset);
	return (
		<>
			<Hero view={view} weekNav={weekNav} />
			{view.error && (
				<Alert data-color="danger">En feil oppstod: {view.error.message}</Alert>
			)}
			{view.days && <DayStrip days={view.days} onLock={view.lock} />}
			{view.unmatchedCount > 0 && (
				<Alert data-color="warning">
					{view.unmatchedCount} Jira-føringer mangler regel og blir ikke
					synkronisert.
				</Alert>
			)}
			{view.changes.length > 0 && (
				<section className={styles.panel}>
					<Heading level={2} data-size="xs">
						Dette endres i Timekeeper
					</Heading>
					<ChangeList changes={view.changes} />
				</section>
			)}
			{view.data && (
				<Details className={styles.details}>
					<Details.Summary>Alle timer denne uka</Details.Summary>
					<Details.Content>
						<TimeTable
							entries={toGridEntries(view.data)}
							days={view.data.map((r) => r.date)}
							onLockDate={view.lock}
						/>
					</Details.Content>
				</Details>
			)}
			{view.updateLockDate.isError && (
				<Alert data-color="danger">
					Kunne ikke låse: {view.updateLockDate.error.message}
				</Alert>
			)}
		</>
	);
};

export const Hero: React.FC<
	React.PropsWithChildren<{
		view: WeekView;
		weekNav: ReturnType<typeof usePrototypeWeek>;
		/** Variant D: a "Forhåndsvis" button next to the sync button. */
		onPreview?: () => void;
		sectionRef?: React.Ref<HTMLElement>;
	}>
> = ({ view, weekNav, onPreview, sectionRef, children }) => {
	const { week, year } = IsoWeek.toParts(weekNav.week);
	const n = view.changes.length;
	const total = view.days?.reduce((s, d) => s + d.bekkHours, 0) ?? 0;
	const state = !view.data
		? "loading"
		: view.justSynced
			? "synced"
			: n > 0
				? "changes"
				: "ok";

	return (
		<section
			ref={sectionRef}
			className={`${styles.hero} ${styles[`hero--${state}`]}`}
		>
			<div className={styles.hero__left}>
				<div className={styles.hero__week}>
					<Button
						variant="tertiary"
						icon
						aria-label="Forrige uke"
						onClick={weekNav.previous}
						className={styles.hero__arrow}
					>
						<ArrowLeftIcon aria-hidden />
					</Button>
					<div>
						<div className={styles.hero__eyebrow}>
							{year} · {weekRange(weekNav.week)}
						</div>
						<h1 className={styles.hero__title}>Uke {week}</h1>
						<div className={styles.hero__sub}>
							{formatHours(total)} timer ført
						</div>
					</div>
					<Button
						variant="tertiary"
						icon
						aria-label="Neste uke"
						onClick={weekNav.next}
						className={styles.hero__arrow}
					>
						<ArrowRightIcon aria-hidden />
					</Button>
				</div>
				{children}
			</div>
			<div className={styles.hero__status}>
				{state === "loading" && (
					<div className={styles.hero__message}>Henter timer…</div>
				)}
				{state === "changes" && (
					<>
						<div className={styles.hero__big}>
							{n}
							<span>endringer venter</span>
						</div>
						<div className={styles.hero__buttons}>
							{onPreview && (
								<Button
									data-size="lg"
									variant="tertiary"
									disabled={view.busy}
									onClick={onPreview}
									className={styles.hero__ghost}
								>
									<EyeIcon aria-hidden />
									Forhåndsvis
								</Button>
							)}
							<Button
								data-size="lg"
								loading={view.busy}
								disabled={view.busy}
								onClick={() => void view.runSync()}
								className={styles.hero__cta}
							>
								Synkroniser til Timekeeper
							</Button>
						</div>
					</>
				)}
				{(state === "ok" || state === "synced") && (
					<div className={styles.hero__message}>
						<CheckmarkCircleFillIcon
							aria-hidden
							className={styles.hero__okIcon}
						/>
						{state === "synced" ? "Timene ble oppdatert!" : "Alt stemmer!"}
					</div>
				)}
				{view.sync.isError && (
					<div className={styles.hero__error}>
						Synkronisering feilet: {view.sync.error.message}
					</div>
				)}
			</div>
		</section>
	);
};

const statusIcon = (day: DaySummary) => {
	switch (day.status) {
		case "ok":
			return <CheckmarkCircleFillIcon title="Stemmer" />;
		case "changes":
			return <ExclamationmarkTriangleFillIcon title="Endres" />;
		case "unmatched":
			return <XMarkOctagonFillIcon title="Jira-føring uten regel" />;
		case "lockedMismatch":
			return <ExclamationmarkTriangleFillIcon title="Låst, avviker fra Jira" />;
		default:
			return null;
	}
};

const DayStrip: React.FC<{
	days: DaySummary[];
	onLock: (day: IsoDate) => void;
}> = ({ days, onLock }) => {
	const now = today();
	return (
		<ol className={styles.strip}>
			{days.map((day) => (
				<li
					key={day.date}
					className={[
						styles.tile,
						styles[`tile--${day.status}`],
						IsoDate.weekday(day.date) >= 6 ? styles["tile--weekend"] : "",
						day.date === now ? styles["tile--today"] : "",
					]
						.filter(Boolean)
						.join(" ")}
				>
					<div className={styles.tile__top}>
						<span className={styles.tile__weekday}>
							{weekdayShort(day.date)}
						</span>
						<span className={styles.tile__icon}>{statusIcon(day)}</span>
					</div>
					<div className={styles.tile__date}>
						{dayOfMonth(day.date)}. {monthShort(day.date)}
					</div>
					<div className={styles.tile__hours}>
						{day.status === "empty" ? "–" : formatHours(day.bekkHours)}
						{day.changes > 0 && (
							<span className={styles.tile__target}>
								→ {formatHours(day.targetHours)}
							</span>
						)}
					</div>
					<button
						type="button"
						className={styles.tile__lock}
						disabled={day.locked}
						title={
							day.locked
								? `${IsoDate.formatLong(day.date)} er låst`
								: `Lås timer til og med ${IsoDate.formatLong(day.date)}`
						}
						onClick={() => onLock(day.date)}
					>
						{day.locked ? (
							<>
								<PadlockLockedIcon aria-hidden /> Låst
							</>
						) : (
							<>
								<PadlockUnlockedIcon aria-hidden /> Lås
							</>
						)}
					</button>
				</li>
			))}
		</ol>
	);
};
