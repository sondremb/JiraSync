import React from "react";
import { useBekkTimecode } from "../data/useBekkTimecode";

export const TimecodeLabel: React.FC<{ timecodeId: number }> = ({
	timecodeId,
}) => {
	const timecode = useBekkTimecode(timecodeId);
	if (timecode === undefined) return <>Timekode {timecodeId}</>;
	return (
		<>
			{timecode.code} {timecode.name}
		</>
	);
};
