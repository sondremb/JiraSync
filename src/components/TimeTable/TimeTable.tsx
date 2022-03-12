import { colors, FlexColumn, Table, Text } from "@udir/lisa";
import { Moment } from "moment";
import React, { useMemo } from "react";
import styled from "styled-components";
import { useStore } from "../../store/store";
import { BekkId, BekkTimecodeEntry, Day } from "../../types";
import { toDateString } from "../../Utils/dateUtils";

interface Props {
	entries: BekkTimecodeEntry[];
	days: Moment[];
}

const CapitalText = styled(Text)`
	text-transform: capitalize;
`;

const ContainerDiv = styled(Text)<{ correct: boolean }>`
	border-radius: 5px;
	position: relative;
	height: 50px;
	width: 50px;
	line-height: 35px;
	border: 1px solid
		${(props) =>
			props.correct
				? colors.utvidetPrimærpalett.stålblå91.hex
				: colors.semantisk.rød.hex};
	text-align: center;
`;

const CornerDiv = styled.div`
	border-top-left-radius: 5px;
	position: absolute;
	bottom: 0;
	right: 0;
	width: 20px;
	height: 20px;
	border-top: 1px solid;
	border-left: 1px solid;
	border-color: inherit;
	text-align: center;
`;

export const TimeTable: React.FC<Props> = (props) => {
	const { state } = useStore();
	const displayTimecode = (timecodeEntry: BekkTimecodeEntry) => {
		const timecode = state.bekkTimecodes[timecodeEntry.id];
		return (
			<FlexColumn>
				<Text>{timecode.code}</Text>
				<Text textStyle="Tabelltekst">{timecode.name}</Text>
			</FlexColumn>
		);
	};

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

	const displayDay = (day: Day | undefined, timecodeId: BekkId) => {
		const timecode = state.bekkTimecodes[timecodeId];
		const correct = !timecode.isUdir || day?.bekkHours === day?.totalJiraHours;
		return (
			<ContainerDiv textStyle="Overskrift 4" correct={correct}>
				{day !== undefined && (
					<>
						{day.bekkHours}
						<CornerDiv>
							<Text textStyle="Tabelltekst">{day.totalJiraHours || ""}</Text>
						</CornerDiv>
					</>
				)}
			</ContainerDiv>
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
	const items = useMemo(
		() =>
			props.entries
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
				}),
		[props.entries]
	);

	return (
		<div>
			<Table
				columns={[
					{
						headerName: "Kode",
						displayFunction: displayTimecode,
						width: "25%",
					},
					...props.days.map((day) => ({
						headerName: dateHeader(day),
						displayFunction: (i: BekkTimecodeEntry) => {
							const thing = i.days[toDateString(day)];
							return displayDay(thing, i.id);
						},
					})),
				]}
				items={items}
				numberOfRowVisible={7}
				rowColor={() => colors.utvidetPrimærpalett.stålblå98}
			/>
			{allGood && (
				<span>
					<span>✓</span> Alle dager stemmer!
				</span>
			)}
		</div>
	);
};
