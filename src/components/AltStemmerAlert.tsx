import React from "react";
import { Alert, Button, FlexRow } from "@utdanningsdirektoratet/lisa";
import { BekkTimecodeEntry } from "../types";
import { isUdir } from "../timecode-map";

interface Props {
	entries: BekkTimecodeEntry[] | undefined;
	onSynchronize: () => void;
}

export const AltStemmerAlert: React.FC<Props> = (props) => {
	if (props.entries === undefined) return null;

	const timecodeAllGood = (timecode: BekkTimecodeEntry) =>
		!isUdir(timecode.id) ||
		Object.values(timecode.days).every(
			(day) => day.bekkHours === day.totalJiraHours
		);
	const allGood = props.entries.every(timecodeAllGood);

	return (
		<FlexRow className="mt-20" halign="center">
			{allGood ? (
				<Alert showAlert={props.entries.every(timecodeAllGood)} type="success">
					Alle dager stemmer!
				</Alert>
			) : (
				<Button onClick={props.onSynchronize} icon="refresh">
					Synkroniser!
				</Button>
			)}
		</FlexRow>
	);
};
