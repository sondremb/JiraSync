import React from "react";
import {
	ArrowRightIcon,
	CheckmarkIcon,
	ExclamationmarkIcon,
	PadlockLockedIcon,
} from "@navikt/aksel-icons";
import type { DayStatus } from "./weekStatus";
import styles from "./StatusMark.module.css";

export type StatusTone = "warning" | "success" | "danger" | "neutral";

const toneOf: Record<DayStatus, StatusTone | undefined> = {
	unmatched: "danger",
	willChange: "warning",
	lockedDiffers: "neutral",
	inSync: "success",
	empty: undefined,
};

/** The same symbols as in the hours cells, so the tones differ by shape too. */
const glyphOf: Record<StatusTone, React.FC<{ className?: string }>> = {
	success: CheckmarkIcon,
	warning: ArrowRightIcon,
	danger: ExclamationmarkIcon,
	neutral: PadlockLockedIcon,
};

const labelOf: Record<DayStatus, string> = {
	unmatched: "Har Jira-føringer uten regel",
	willChange: "Blir endret",
	lockedDiffers: "Låst, avviker fra Jira",
	inSync: "Stemmer",
	empty: "Ingen timer",
};

/**
 * A small coloured badge with a symbol, for a day's status or a status count.
 * A day's status is announced; a count's mark is decoration, as its text
 * already says what it is.
 */
export const StatusMark: React.FC<
	{ status: DayStatus; tone?: never } | { tone: StatusTone; status?: never }
> = ({ status, tone }) => {
	const markTone = tone ?? (status ? toneOf[status] : undefined);
	if (!markTone) return null;
	const Glyph = glyphOf[markTone];
	const label = status ? labelOf[status] : undefined;
	return (
		<span
			className={`${styles.statusMark} ${styles[`statusMark--${markTone}`]}`}
			title={label}
			{...(label
				? { role: "img", "aria-label": label }
				: { "aria-hidden": true })}
		>
			<Glyph className={styles.statusMark__glyph} />
		</span>
	);
};
