/**
 * PROTOTYPE, throw away. Variant D "Kort + rutenett": a slim one-row status
 * card (week, status chips, sync and preview), taking the idea from C's hero
 * but not its weight, on top of B's status grid. B's sticky action bar only
 * appears once the card has scrolled out of view, so the sync button is never
 * shown twice.
 */
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "@digdir/designsystemet-react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckmarkCircleFillIcon,
	EyeIcon,
} from "@navikt/aksel-icons";
import { formatHours, IsoWeek } from "../../date-time/IsoWeek";
import { useRuleSet } from "../../data/useRuleset";
import { DayList } from "../TimeTable/DayList";
import { toGridEntries } from "../TimeTable/gridModel";
import {
	AppBar,
	PreviewDialog,
	usePrototypeWeek,
	useWeekView,
	weekRange,
	type WeekView,
} from "./shared";
import { ActionBar, Grid } from "./VariantB";
import bStyles from "./VariantB.module.css";
import styles from "./VariantD.module.css";

export const VariantD: React.FC = () => {
	const { selectedRuleset } = useRuleSet();
	const weekNav = usePrototypeWeek();
	return (
		<div className={bStyles.page}>
			<AppBar />
			<main className={bStyles.main}>
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

/** True while the element is on screen. */
const useOnScreen = (ref: React.RefObject<HTMLElement | null>) => {
	const [onScreen, setOnScreen] = useState(true);
	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry]) =>
			setOnScreen(entry.isIntersecting),
		);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [ref]);
	return onScreen;
};

const Week: React.FC<{
	weekNav: ReturnType<typeof usePrototypeWeek>;
	ruleset: NonNullable<ReturnType<typeof useRuleSet>["selectedRuleset"]>;
}> = ({ weekNav, ruleset }) => {
	const view = useWeekView(weekNav.week, ruleset);
	const [previewOpen, setPreviewOpen] = useState(false);
	const heroRef = useRef<HTMLElement>(null);
	const heroOnScreen = useOnScreen(heroRef);

	return (
		<>
			<SlimCard
				view={view}
				weekNav={weekNav}
				onPreview={() => setPreviewOpen(true)}
				sectionRef={heroRef}
			/>
			{view.error && (
				<Alert data-color="danger">En feil oppstod: {view.error.message}</Alert>
			)}
			<div className={bStyles.card}>
				{view.data && view.days ? (
					<Grid
						entries={toGridEntries(view.data)}
						days={view.days}
						onLock={view.lock}
					/>
				) : (
					<div className={bStyles.loading}>Henter timer…</div>
				)}
				{view.data && (
					<DayList
						className={bStyles.narrowList}
						reports={view.data}
						onLockDate={view.lock}
					/>
				)}
			</div>
			{view.updateLockDate.isError && (
				<Alert data-color="danger">
					Kunne ikke låse: {view.updateLockDate.error.message}
				</Alert>
			)}
			<div
				className={`${styles.stickyBar} ${heroOnScreen ? styles["stickyBar--hidden"] : ""}`}
				aria-hidden={heroOnScreen}
			>
				<ActionBar view={view} onPreview={() => setPreviewOpen(true)} />
			</div>
			<PreviewDialog
				view={view}
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
			/>
		</>
	);
};

/** One row: week and navigation, status chips, then the actions. */
const SlimCard: React.FC<{
	view: WeekView;
	weekNav: ReturnType<typeof usePrototypeWeek>;
	onPreview: () => void;
	sectionRef: React.Ref<HTMLElement>;
}> = ({ view, weekNav, onPreview, sectionRef }) => {
	const { week } = IsoWeek.toParts(weekNav.week);
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
			className={`${styles.slim} ${styles[`slim--${state}`]}`}
		>
			<div className={styles.slim__week}>
				<Button
					variant="tertiary"
					icon
					data-size="sm"
					aria-label="Forrige uke"
					onClick={weekNav.previous}
				>
					<ArrowLeftIcon aria-hidden />
				</Button>
				<div className={styles.slim__heading}>
					<h1 className={styles.slim__title}>Uke {week}</h1>
					<span className={styles.slim__meta}>
						{weekRange(weekNav.week)} · {formatHours(total)} t ført
					</span>
				</div>
				<Button
					variant="tertiary"
					icon
					data-size="sm"
					aria-label="Neste uke"
					onClick={weekNav.next}
				>
					<ArrowRightIcon aria-hidden />
				</Button>
			</div>
			<StatusChips view={view} />
			<div className={styles.slim__actions}>
				{state === "loading" && (
					<span className={styles.slim__message}>Henter timer…</span>
				)}
				{state === "changes" && (
					<>
						<Button variant="tertiary" disabled={view.busy} onClick={onPreview}>
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
					</>
				)}
				{(state === "ok" || state === "synced") && (
					<span className={styles.slim__message}>
						<CheckmarkCircleFillIcon
							aria-hidden
							className={styles.slim__okIcon}
						/>
						{state === "synced" ? "Timene ble oppdatert!" : "Alt stemmer!"}
					</span>
				)}
			</div>
			{view.sync.isError && (
				<Alert data-color="danger" className={styles.slim__error}>
					Synkronisering feilet: {view.sync.error.message}
				</Alert>
			)}
		</section>
	);
};

/** B's status chips, as small dots and text. */
const StatusChips: React.FC<{ view: WeekView }> = ({ view }) => {
	if (!view.days) return null;
	const toSync = view.days.filter((d) => d.changes > 0).length;
	const ok = view.days.filter((d) => d.status === "ok").length;
	const chips = [
		toSync > 0 && {
			tone: "warning",
			text: `${toSync} ${toSync === 1 ? "dag" : "dager"} å synke`,
		},
		ok > 0 && { tone: "success", text: `${ok} i synk` },
		view.unmatchedCount > 0 && {
			tone: "danger",
			text: `${view.unmatchedCount} Jira-føring uten regel`,
		},
		view.lockedDays.length > 0 && {
			tone: "neutral",
			text: `${view.lockedDays.length} låst dag avviker`,
		},
	].filter(Boolean) as { tone: string; text: string }[];
	if (chips.length === 0) return null;
	return (
		<ul className={styles.chips}>
			{chips.map((chip) => (
				<li key={chip.text} className={styles.chip}>
					<span
						className={`${styles.chip__dot} ${styles[`chip__dot--${chip.tone}`]}`}
					/>
					{chip.text}
				</li>
			))}
		</ul>
	);
};
