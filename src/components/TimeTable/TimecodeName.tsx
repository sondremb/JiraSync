import React from "react";
import { useBekkTimecode } from "../../data/useBekkTimecode";
import type { BekkTimecodeId } from "../../reconciliation/entities";
import styles from "./TimecodeName.module.css";

/** Timecode code, with its name below in a smaller, subtle font. */
export const TimecodeName: React.FC<{ id: BekkTimecodeId }> = ({ id }) => {
	const timecode = useBekkTimecode(id);
	if (timecode === undefined) return <>Timekode {id}</>;
	return (
		<>
			{timecode.code}
			<span className={styles.timecodeName__name}>{timecode.name}</span>
		</>
	);
};
