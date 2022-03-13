import React from "react";
import { colors, ColorType, FlexColumn, Icon, spacing, Text } from "@udir/lisa";
import styled from "styled-components";
import { Row } from "./TimeTable";
import { useStore } from "../../store/store";
import { Moment } from "moment";
import { toDateString } from "../../Utils/dateUtils";
import { FrivilligKompetanseByggingId } from "../../timecode-map";

const ContainerDiv = styled(Text)<{ correct: boolean; border: boolean }>`
	border-radius: 5px;
	position: relative;
	height: 50px;
	width: 50px;
	line-height: 40px;
	${(props) =>
		props.border &&
		`border: 1px solid
		${
			props.correct
				? colors.utvidetPrimærpalett.stålblå91.hex
				: colors.semantisk.rød.hex
		}`};
	${(props) => !props.correct && `color: ${colors.semantisk.rød.hex}`};
	text-align: center;
`;

const OtherDiv = styled(Text)`
	width: 50px;
	text-align: center;
`;

const CornerDiv = styled(Text)<{ correct: boolean }>`
	position: absolute;
	bottom: 0;
	right: 0;
	padding-right: ${spacing(4)};
	border-color: inherit;
	text-align: right;
	${(props) => !props.correct && `color: ${colors.semantisk.rød.hex}`};
`;

interface Props {
	row: Row;
	day: Moment;
}

export const TimetableCell: React.FC<Props> = (props) => {
	const { state } = useStore();
	const dateString = toDateString(props.day);
	switch (props.row.kind) {
		case "lock":
			return (
				<OtherDiv>
					<Icon
						type={
							props.day.isBefore(props.row.lockDate) ? "locked" : "unlocked"
						}
						getColor={(c: ColorType) => c.støttefarge.grå98}
					/>
				</OtherDiv>
			);
		case "sum":
			return (
				<OtherDiv
					textStyle="Overskrift 3"
					getColor={(c: ColorType) => c.støttefarge.grå98}
				>
					{props.row.entries
						// frivillig kompetansebygging teller ikke mot kravet om 37.5 timer i uka
						.filter((entry) => entry.id !== FrivilligKompetanseByggingId)
						.map((entry) => entry.days[dateString]?.bekkHours ?? 0)
						.reduce((prev, curr) => prev + curr, 0)}
				</OtherDiv>
			);
		case "entry":
			const entry = props.row.entry;
			const day = entry.days[dateString];
			const timecode = state.bekkTimecodes[entry.id];
			const correct =
				!timecode.isUdir || day?.bekkHours === day?.totalJiraHours;
			const jiraHours = day?.totalJiraHours || (timecode.isUdir ? 0 : "");
			return (
				<ContainerDiv
					textStyle={correct ? "Overskrift 3" : "Overskrift 2"}
					correct={correct}
					border
				>
					{day !== undefined && (
						<>
							{day.bekkHours}
							<CornerDiv
								correct={correct}
								textStyle={correct ? "Tabelltekst" : "Tabelltekst uthevet"}
							>
								{jiraHours}
							</CornerDiv>
						</>
					)}
				</ContainerDiv>
			);
	}
};

export const FirstColumnCell: React.FC<{ row: Row }> = ({ row }) => {
	const { state } = useStore();
	if (row.kind === "sum")
		return (
			<Text
				textStyle="Overskrift 4"
				getColor={(c: ColorType) => c.støttefarge.grå98}
			>
				Totalt
			</Text>
		);
	if (row.kind === "lock") return <></>;
	const timecode = state.bekkTimecodes[row.entry.id];
	return (
		<FlexColumn>
			<Text>{timecode.code}</Text>
			<Text textStyle="Tabelltekst">{timecode.name}</Text>
		</FlexColumn>
	);
};

export const SumColumnCell: React.FC<{ row: Row }> = ({ row }) => {
	switch (row.kind) {
		case "entry":
			return (
				<OtherDiv textStyle="Overskrift 3">
					{Object.values(row.entry.days)
						.map((day) => day.bekkHours)
						.reduce((prev, curr) => prev + curr, 0)}
				</OtherDiv>
			);
		case "sum":
			const totalBekkHoursAllWeek = row.entries
				.filter((entry) => entry.id !== FrivilligKompetanseByggingId)
				.flatMap((entry) =>
					Object.values(entry.days).map((day) => day.bekkHours)
				)
				.reduce((prev, curr) => prev + curr, 0);
			return (
				<OtherDiv
					textStyle="Overskrift 3"
					getColor={(c: ColorType) =>
						totalBekkHoursAllWeek === 37.5
							? c.støttefarge.grå98
							: c.utvidetPrimærpalett.fersken65
					}
				>
					{totalBekkHoursAllWeek ?? 0}
				</OtherDiv>
			);
		case "lock":
			return <></>;
	}
};
