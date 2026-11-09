import React from "react";
import { ArrowLeftIcon } from "@navikt/aksel-icons";
import styles from "./HoursBox.module.css";

interface Props {
	/** Hours in Bekk Timekeeper, shown large. */
	bekkHours?: number;
	/** Hours in Jira, shown in the corner. Omitted for unmanaged timecodes. */
	jiraHours?: number;
	mismatch: boolean;
}

/** One day for one timecode: Bekk hours, with Jira hours in the corner. */
export const HoursBox: React.FC<Props> = ({
	bekkHours,
	jiraHours,
	mismatch,
}) => (
	<div
		className={[styles.hoursBox, mismatch ? styles["hoursBox--mismatch"] : ""]
			.filter(Boolean)
			.join(" ")}
		title={
			bekkHours === undefined
				? undefined
				: jiraHours === undefined
					? `Timekeeper: ${bekkHours}`
					: `Timekeeper: ${bekkHours}, Jira: ${jiraHours}`
		}
	>
		{bekkHours}
		{jiraHours !== undefined && (
			<span className={styles.hoursBox__jira}>{jiraHours}</span>
		)}
	</div>
);

/** Explains the numbers in an `HoursBox`. */
export const HoursLegend: React.FC = () => (
	<div className={styles.hoursLegend}>
		<HoursBox bekkHours={0} jiraHours={7.5} mismatch />
		<div className={styles.hoursLegend__labels}>
			<span className={styles.hoursLegend__label}>
				<ArrowLeftIcon aria-hidden />
				Timekeeper-timer
			</span>
			<span className={styles.hoursLegend__label}>
				<ArrowLeftIcon aria-hidden />
				Jira-timer
			</span>
		</div>
	</div>
);
