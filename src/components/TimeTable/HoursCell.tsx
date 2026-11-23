import React from "react";
import { CheckmarkIcon } from "@navikt/aksel-icons";
import { formatHours } from "../../date-time/IsoWeek";
import type { CellState } from "./gridModel";
import styles from "./HoursCell.module.css";

interface Props {
	state: CellState;
	/** Hours in Bekk Timekeeper. */
	bekkHours: number;
	/** Hours in Jira. Ignored for unmanaged timecodes. */
	jiraHours: number;
}

/**
 * One timecode on one day, styled by its state. A cell that differs from Jira
 * shows the Bekk hours struck through and the Jira hours it should have.
 */
export const HoursCell: React.FC<Props> = ({ state, bekkHours, jiraHours }) => {
	const bekk = formatHours(bekkHours);
	const jira = formatHours(jiraHours);
	switch (state) {
		case "empty":
			return (
				<span className={styles.hoursCell__empty}>
					<span aria-hidden>·</span>
					<span className="ds-sr-only">Ingen timer</span>
				</span>
			);
		case "unmanaged":
			return (
				<span
					className={`${styles.hoursCell} ${styles["hoursCell--unmanaged"]}`}
					title="Timekoden styres ikke av reglene"
				>
					{bekk}
					<span className="ds-sr-only"> timer, styres ikke av reglene</span>
				</span>
			);
		case "inSync":
			return (
				<span
					className={`${styles.hoursCell} ${styles["hoursCell--inSync"]}`}
					title={`Timekeeper og Jira: ${bekk}`}
				>
					{bekk}
					<CheckmarkIcon aria-hidden className={styles.hoursCell__check} />
					<span className="ds-sr-only"> timer, stemmer med Jira</span>
				</span>
			);
		case "willChange":
		case "lockedDiffers":
			return (
				<span
					className={`${styles.hoursCell} ${styles["hoursCell--differs"]} ${styles[`hoursCell--${state}`]}`}
					title={`Timekeeper: ${bekk}, Jira: ${jira}`}
				>
					<span aria-hidden className={styles.hoursCell__from}>
						{bekk}
					</span>
					<span aria-hidden className={styles.hoursCell__to}>
						{jira}
					</span>
					<span className="ds-sr-only">
						Timekeeper {bekk}, Jira {jira}
						{state === "lockedDiffers" ? ", låst" : ", blir endret"}
					</span>
				</span>
			);
	}
};
