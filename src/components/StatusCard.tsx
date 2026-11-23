import React from "react";
import { Button, Paragraph } from "@digdir/designsystemet-react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckmarkCircleFillIcon,
	EyeIcon,
} from "@navikt/aksel-icons";
import { formatHours, IsoWeek } from "../date-time/IsoWeek";
import { StatusDot, type StatusTone } from "./TimeTable/StatusDot";
import type { WeekStatus } from "./TimeTable/weekStatus";
import styles from "./StatusCard.module.css";

/** What the card's right-hand side shows. */
export type SyncState =
	| { kind: "loading" }
	| { kind: "error" }
	| { kind: "changes"; count: number; busy: boolean }
	| { kind: "synced" }
	| { kind: "inSync" }
	/** Nothing to sync, but not all is well: locked days or unmatched worklogs. */
	| { kind: "nothingToSync" };

interface Props {
	week: IsoWeek;
	status?: WeekStatus;
	sync: SyncState;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onSync: () => void;
	onPreview: () => void;
}

/**
 * The week at a glance, in one slim row: week navigation, status counts, and
 * the sync actions or how the week stands.
 */
export const StatusCard = React.forwardRef<HTMLElement, Props>(
	function StatusCard(
		{ week, status, sync, onPreviousWeek, onNextWeek, onSync, onPreview },
		ref,
	) {
		const { week: number } = IsoWeek.toParts(week);
		const settled = sync.kind === "inSync" || sync.kind === "synced";
		return (
			<section
				ref={ref}
				aria-label="Status for uka"
				className={[
					styles.statusCard,
					settled ? styles["statusCard--settled"] : "",
					sync.kind === "loading" ? styles["statusCard--loading"] : "",
				]
					.filter(Boolean)
					.join(" ")}
			>
				<nav aria-label="Uke" className={styles.statusCard__week}>
					<Button
						variant="tertiary"
						icon
						data-size="sm"
						aria-label="Forrige uke"
						onClick={onPreviousWeek}
					>
						<ArrowLeftIcon aria-hidden />
					</Button>
					<div className={styles.statusCard__heading} aria-live="polite">
						<h2 className={styles.statusCard__title}>Uke {number}</h2>
						<span className={styles.statusCard__meta}>
							{IsoWeek.formatRange(week)}
							{status && ` · ${formatHours(status.bekkHours)} t ført`}
						</span>
					</div>
					<Button
						variant="tertiary"
						icon
						data-size="sm"
						aria-label="Neste uke"
						onClick={onNextWeek}
					>
						<ArrowRightIcon aria-hidden />
					</Button>
				</nav>
				{status && <StatusCounts status={status} />}
				<div className={styles.statusCard__actions}>
					<SyncActions sync={sync} onSync={onSync} onPreview={onPreview} />
				</div>
			</section>
		);
	},
);

const StatusCounts: React.FC<{ status: WeekStatus }> = ({ status }) => {
	const counts: { tone: StatusTone; text: string }[] = [];
	if (status.daysToSync > 0)
		counts.push({
			tone: "warning",
			text: `${status.daysToSync} ${status.daysToSync === 1 ? "dag" : "dager"} å synkronisere`,
		});
	if (status.daysInSync > 0)
		counts.push({ tone: "success", text: `${status.daysInSync} i synk` });
	if (status.unmatchedWorklogs > 0)
		counts.push({
			tone: "danger",
			text: `${status.unmatchedWorklogs} Jira-${status.unmatchedWorklogs === 1 ? "føring" : "føringer"} uten regel`,
		});
	if (status.lockedDaysDiffering > 0)
		counts.push({
			tone: "neutral",
			text: `${status.lockedDaysDiffering} låst${status.lockedDaysDiffering === 1 ? " dag avviker" : "e dager avviker"}`,
		});
	if (counts.length === 0) return null;
	return (
		<ul className={styles.statusCard__counts}>
			{counts.map((count) => (
				<li key={count.text} className={styles.statusCard__count}>
					<StatusDot tone={count.tone} />
					{count.text}
				</li>
			))}
		</ul>
	);
};

/** The sync buttons, or a message when there is nothing to sync. */
export const SyncActions: React.FC<{
	sync: SyncState;
	onSync: () => void;
	onPreview: () => void;
}> = ({ sync, onSync, onPreview }) => {
	switch (sync.kind) {
		case "changes":
			return (
				<>
					<Button variant="tertiary" disabled={sync.busy} onClick={onPreview}>
						<EyeIcon aria-hidden />
						Forhåndsvis
					</Button>
					<Button
						// `loading` only shows a spinner, so block clicks while the
						// data behind the changes may be stale.
						loading={sync.busy}
						disabled={sync.busy}
						onClick={onSync}
					>
						Synkroniser {sync.count}{" "}
						{sync.count === 1 ? "endring" : "endringer"}
					</Button>
				</>
			);
		case "synced":
		case "inSync":
			return (
				<Paragraph className={styles.statusCard__message}>
					<CheckmarkCircleFillIcon
						aria-hidden
						className={styles.statusCard__ok}
					/>
					{sync.kind === "synced" ? "Timene ble oppdatert!" : "Alt stemmer!"}
				</Paragraph>
			);
		case "nothingToSync":
			return (
				<Paragraph className={styles.statusCard__message}>
					Ingenting å synkronisere
				</Paragraph>
			);
		case "loading":
		case "error":
			return null;
	}
};
