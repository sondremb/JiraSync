import { Alert, colors, FlexColumn, FlexRow, Table, Text } from "@udir/lisa";
import { Moment } from "moment";
import React from "react";
import styled from "styled-components";
import { useBekkTimecodes } from "../../data/useBekkTimecodes";
import { isUdir } from "../../timecode-map";
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
	const { bekkTimecodes } = useBekkTimecodes();
	if (bekkTimecodes === undefined) return null;

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
		isUdir(bekkTimecodes[timecode.id]) ||
		Object.values(timecode.days).every(
			(day) => day.bekkHours === day.totalJiraHours
		);

	const allGood = props.entries.every(timecodeAllGood);

	const compareTimecodesByCode = (
		a: BekkTimecodeEntry,
		b: BekkTimecodeEntry
	): number => {
		const timecodeA = bekkTimecodes[a.id];
		const timecodeB = bekkTimecodes[b.id];
		if (!!timecodeA.code && !!timecodeB.code) {
			return timecodeA.code?.localeCompare(timecodeB.code);
		}
		return 0;
	};

	const compareTimecodesByUdir = (
		a: BekkTimecodeEntry,
		b: BekkTimecodeEntry
	): number => {
		const isAUdir = isUdir(bekkTimecodes[a.id]);
		const isBUdir = isUdir(bekkTimecodes[b.id]);
		if (isAUdir && !isBUdir) return -1;
		if (!isAUdir && isBUdir) return 1;
		return 0;
	};

	// Todelt sortering:
	//  1. Udir-timekoder først
	//  2. Alfabetisk på timekode
	const rows: Row[] = props.entries
		.sort(compareTimecodesByCode)
		.sort(compareTimecodesByUdir)
		.map((entry) => ({ kind: "entry", entry }));
	const items: Row[] = [
		...rows,
		{ kind: "sum", entries: props.entries },
		{ kind: "lock", lockDate: props.lockDate },
	];

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
