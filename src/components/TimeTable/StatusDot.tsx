import React from "react";
import type { DayStatus } from "./weekStatus";
import styles from "./StatusDot.module.css";

export type StatusTone = "warning" | "success" | "danger" | "neutral";

const toneOf: Record<DayStatus, StatusTone | undefined> = {
	unmatched: "danger",
	willChange: "warning",
	lockedDiffers: "neutral",
	inSync: "success",
	empty: undefined,
};

const labelOf: Record<DayStatus, string> = {
	unmatched: "Har Jira-føringer uten regel",
	willChange: "Blir endret",
	lockedDiffers: "Låst, avviker fra Jira",
	inSync: "Stemmer",
	empty: "Ingen timer",
};

/** A small coloured dot, for a day's status or a status count. */
export const StatusDot: React.FC<
	{ status: DayStatus; tone?: never } | { tone: StatusTone; status?: never }
> = ({ status, tone }) => {
	const dotTone = tone ?? (status ? toneOf[status] : undefined);
	if (!dotTone) return null;
	return (
		<span
			className={`${styles.statusDot} ${styles[`statusDot--${dotTone}`]}`}
			title={status ? labelOf[status] : undefined}
			aria-hidden
		/>
	);
};
