import { colors, FlexColumn, Table, Text } from "@udir/lisa";
import { Moment } from "moment";
import React from "react";
import styled from "styled-components";
import { BekkTimecodeEntry, Day, State } from "../../types";
import { toDateString } from "../../Utils/dateUtils";

interface Props {
	data: State;
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
	const { entries, bekkTimecodes } = props.data;

	const displayTimecode = (timecodeEntry: BekkTimecodeEntry) => {
		const timecode = bekkTimecodes[timecodeEntry.id];
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

	const displayDay = (day: Day | undefined) => {
		return (
			<ContainerDiv
				textStyle="Overskrift 4"
				correct={day?.bekkHours === day?.totalJiraHours}
			>
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
		!bekkTimecodes[timecode.id].isUdir ||
		Object.values(timecode.days).every(
			(day) => day.bekkHours === day.totalJiraHours
		);

	const allGood = entries.every(timecodeAllGood);

	return (
		<div>
			{allGood && (
				<span>
					<span>✓</span> Alle dager stemmer!
				</span>
			)}
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
							return displayDay(thing);
						},
					})),
				]}
				items={entries}
				numberOfRowVisible={7}
			/>
		</div>
	);
};
