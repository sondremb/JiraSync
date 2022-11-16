import { Alert, colors, FlexColumn, FlexRow, Table, Text } from "@udir/lisa";
import { Moment } from "moment";
import React, { useMemo } from "react";
import styled from "styled-components";
import { useStore } from "../../store/store";
import { BekkTimecodeEntry } from "../../types";
import {
	FirstColumnCell,
	SumColumnCell,
	TimetableCell,
} from "./timetable-cell";

interface Props {
	entries: BekkTimecodeEntry[];
	days: Moment[];
	lockDate: Moment;
}

const CapitalText = styled(Text)`
	text-transform: capitalize;
`;

export type Row =
	| {
			kind: "entry";
			entry: BekkTimecodeEntry;
	  }
	| {
			kind: "sum";
			entries: BekkTimecodeEntry[];
	  }
	| {
			kind: "lock";
			lockDate: Moment;
	  };

export const TimeTable: React.FC<Props> = (props) => {
	const { state } = useStore();

	const dateHeader = (date: Moment) => {
		return (
			<FlexColumn>
				<CapitalText textStyle="Tabelltekst uthevet">
					{date.format("dddd")}
				</CapitalText>
				<CapitalText textStyle="Tabelltekst uthevet">
					{date.format("D. MMMM")}
				</CapitalText>
			</FlexColumn>
		);
	};

	const timecodeAllGood = (timecode: BekkTimecodeEntry) =>
		!state.bekkTimecodes[timecode.id].isUdir ||
		Object.values(timecode.days).every(
			(day) => day.bekkHours === day.totalJiraHours
		);

	const allGood = props.entries.every(timecodeAllGood);

	// Todelt sortering:
	//  1. Udir-timekoder først
	//  2. Alfabetisk på timekode
	const items: Row[] = useMemo(() => {
		const mappedEntries: Row[] = [...props.entries]
			.sort((a, b) =>
				state.bekkTimecodes[a.id].code.localeCompare(
					state.bekkTimecodes[b.id].code
				)
			)
			.sort((a, b) => {
				const isAUdir = state.bekkTimecodes[a.id].isUdir;
				const isBUdir = state.bekkTimecodes[b.id].isUdir;
				if (isAUdir && !isBUdir) return -1;
				if (!isAUdir && isBUdir) return 1;
				return 0;
			})
			.map((entry) => ({ kind: "entry", entry }));
		return mappedEntries.concat(
			{ kind: "sum", entries: props.entries },
			{ kind: "lock", lockDate: props.lockDate }
		);
	}, [props.entries]);

	return (
		<div>
			<Table
				headerColor={colors.utvidetPrimærpalett.stålblå98}
				columns={[
					{
						headerName: "Kode",
						displayFunction: (row) => <FirstColumnCell row={row} />,
						width: "25%",
					},
					...props.days.map((day: Moment) => ({
						headerName: dateHeader(day),
						displayFunction: (i: Row) => <TimetableCell day={day} row={i} />,
					})),
					{
						headerName: "Sum",
						displayFunction: (row) => <SumColumnCell row={row} />,
					},
				]}
				items={items}
				rowColor={(row) =>
					row.kind === "entry"
						? colors.utvidetPrimærpalett.stålblå98
						: colors.utvidetPrimærpalett.skifer35
				}
			/>
			<FlexRow halign="center">
				{allGood && <Alert type="success">Alle dager stemmer!</Alert>}
			</FlexRow>
		</div>
	);
};
