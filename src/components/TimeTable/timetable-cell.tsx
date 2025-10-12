import React from "react";
import { FlexColumn, Icon, Text } from "@udir/lisa";
import styled, { css } from "styled-components";
import { Row } from "./TimeTable";
import { FrivilligKompetanseByggingId, isUdir } from "../../timecode-map";
import {
	colors,
	ColorType,
	colorTypeToHex,
	rem,
	spacing,
	Weight,
} from "@udir/lisa-tokens";
import { LockDateButton } from "./LockDateButton";
import { useBekkTimecode } from "../../data/useBekkTimecode";
import { BekkTimecodeEntry, DateString } from "../../types";
import { SkeletonLoader } from "../SkeletonLoader";
import { IsoDate } from "../../date-time/IsoWeek";

const CustomText = styled.div<{
	fontSize?: number;
	bold?: boolean;
	textColor?: ColorType;
}>`
	font-family: Roboto, Arial, Helvetica, sans-serif;
	font-size: ${(props) => rem(props.fontSize ?? 16)};
	line-height: 1.5;
	font-weight: ${(props) => (props.bold ? Weight.Semibold : Weight.Regular)};
	color: ${(props) =>
		props.textColor ? colorTypeToHex(props.textColor) : colors.svart};
`;

const ContainerDiv = styled(CustomText)<{ correct: boolean; border: boolean }>`
	border-radius: 5px;
	position: relative;
	height: 50px;
	width: 50px;
	line-height: 40px;
	${(props) =>
		props.border &&
		css`
			border: 1px solid ${props.correct ? colors.stålblå300 : colors.rød600};
		`};
	${(props) => !props.correct && `color: ${colors.rød600}`};
	text-align: center;
`;

const OtherDiv = styled(CustomText)`
	width: 50px;
	text-align: center;
`;

const CornerDiv = styled(CustomText)<{ correct: boolean }>`
	position: absolute;
	bottom: 0;
	right: 0;
	padding-right: ${spacing(4)};
	border-color: inherit;
	text-align: right;
	${(props) => !props.correct && `color: ${colors.rød600}`};
`;

interface Props {
	row: Row;
	day: IsoDate;
	onLockClicked: (day: IsoDate) => void;
}

export const TimetableCell: React.FC<Props> = (props) => {
	switch (props.row.kind) {
		case "lock":
			return (
				<LockDateButton
					day={props.day}
					onClick={() => props.onLockClicked(props.day)}
				/>
			);
		case "sum":
			return (
				<OtherDiv fontSize={24} textColor={"grå100"}>
					{props.row.entries
						// frivillig kompetansebygging teller ikke mot kravet om 37.5 timer i uka
						.filter((entry) => entry.id !== FrivilligKompetanseByggingId)
						.map((entry) => entry.days[props.day]?.bekkHours ?? 0)
						.reduce((prev, curr) => prev + curr, 0)}
				</OtherDiv>
			);
		case "entry":
			return <EntryCell entry={props.row.entry} dateString={props.day} />;
	}
};

const EntryCell: React.FC<{
	entry: BekkTimecodeEntry;
	dateString: DateString;
}> = ({ entry, dateString }) => {
	const timecode = useBekkTimecode(entry.id);
	if (timecode === undefined) return null;
	const day = entry.days[dateString];

	const correct =
		!isUdir(timecode.id) || day?.bekkHours === day?.totalJiraHours;
	const jiraHours = day?.totalJiraHours || (isUdir(timecode.id) ? 0 : "");
	return (
		<ContainerDiv fontSize={24} bold={!correct} correct={correct} border>
			{day !== undefined && (day.bekkHours !== 0 || day.totalJiraHours !== 0) && (
				<>
					{day.bekkHours}
					<CornerDiv correct={correct} fontSize={14} bold={!correct}>
						{jiraHours}
					</CornerDiv>
				</>
			)}
		</ContainerDiv>
	);
};

export const FirstColumnCell: React.FC<{ row: Row }> = ({ row }) => {
	switch (row.kind) {
		case "sum":
			return (
				<CustomText fontSize={20} bold textColor={"grå100"}>
					Totalt
				</CustomText>
			);
		case "lock":
			return <></>;
		case "entry":
			return <TimeCodeCell entry={row.entry} />;
	}
};

const TimeCodeCell: React.FC<{ entry: BekkTimecodeEntry }> = ({ entry }) => {
	const timecode = useBekkTimecode(entry.id);
	if (timecode === undefined) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
				}}
			>
				<SkeletonLoader>TEST1001</SkeletonLoader>
				<SkeletonLoader textStyle="label">
					Timekoden lastes - Laster nå
				</SkeletonLoader>
			</div>
		);
	}
	return (
		<FlexColumn>
			<Text>{timecode.code}</Text>
			<Text textStyle="label">{timecode.name}</Text>
		</FlexColumn>
	);
};

export const SumColumnCell: React.FC<{ row: Row }> = ({ row }) => {
	switch (row.kind) {
		case "entry":
			return (
				<OtherDiv fontSize={24} bold>
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
					fontSize={24}
					bold
					textColor={totalBekkHoursAllWeek >= 37.5 ? "grå100" : "fersken500"}
				>
					{totalBekkHoursAllWeek ?? 0}
				</OtherDiv>
			);
		case "lock":
			return <></>;
	}
};

const AbsoluteDiv = styled(Text)`
	position: absolute;
	right: 10%;
	top: 10%;
	transform: translateX(100%);
	width: 200px;
	display: flex;
	align-items: center;
`;

export const Example: React.FC = () => {
	const correct = false;
	return (
		<ContainerDiv fontSize={24} bold={!correct} correct={correct} border>
			0
			<AbsoluteDiv>
				<Icon className="mr-8" type="arrowThick" direction="left" />
				Timekeeper-timer
			</AbsoluteDiv>
			<CornerDiv correct={correct} fontSize={14} bold={!correct}>
				7.5
				<AbsoluteDiv>
					<Icon type="arrowThick" direction="left" className="mr-8" />
					Jira-timer
				</AbsoluteDiv>
			</CornerDiv>
		</ContainerDiv>
	);
};
