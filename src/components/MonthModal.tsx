import React from "react";
import {
	Button,
	Container,
	FlexColumn,
	FlexRow,
	H1,
	Icon,
	Modal,
	Text,
} from "@udir/lisa";
import { useState } from "react";
import { useMonth } from "../data/useMonth";
import { MonthAndYear, toDateString } from "../Utils/dateUtils";
import {
	borderRadius,
	ColorType,
	colorTypeToHex,
	textStyles,
} from "@udir/lisa-tokens";
import { Moment } from "moment";
import { FrivilligKompetanseByggingId, isUdir } from "../timecode-map";
import { useLockDate } from "../data/useLockDate";
import styled, { css } from "styled-components";
import { DateString } from "../types";

export const MonthModal: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [monthAndYear, setMonthAndYear] = useState<MonthAndYear>(
		MonthAndYear.now()
	);
	const { state } = useMonth(monthAndYear);
	const { lockDate } = useLockDate();

	const dayAllGood = (day: Moment): boolean => {
		if (state === undefined) return true;
		const dateString = toDateString(day);
		return state.every((entry) => {
			const entryDay = entry.days[dateString];
			return (
				!isUdir(entry.id) ||
				entryDay === undefined ||
				entryDay.bekkHours === entryDay.totalJiraHours
			);
		});
	};

	const sumForDay = (day: Moment): number => {
		if (state === undefined) return 0;
		const dateString: DateString = toDateString(day);
		return state.reduce((prev, entry) => {
			const entryDay = entry.days[dateString];
			if (entryDay === undefined || entry.id === FrivilligKompetanseByggingId) {
				return prev;
			}
			return prev + entryDay.bekkHours;
		}, 0);
	};

	return (
		<>
			<Button
				variant="outlined"
				icon="calendar"
				onClick={() => setIsOpen(true)}
			>
				Månedsvisning
			</Button>
			<Modal
				showModal={isOpen}
				onCancel={() => setIsOpen(false)}
				padding={0}
				aria={{ "aria-labelledby": "month-modal-title" }}
			>
				<Container padding={{ x: 40, top: 20 }} margin={{ bottom: 40 }}>
					<H1 id="month-modal-title" textStyle="headline">
						Månedsvisning
					</H1>
					<Table>
						<thead>
							<tr>
								<th className="pb-8"></th>
								<th className="pb-8">Ma</th>
								<th className="pb-8">Ti</th>
								<th className="pb-8">On</th>
								<th className="pb-8">To</th>
								<th className="pb-8">Fr</th>
								<th className="pb-8">Lø</th>
								<th className="pb-8">Sø</th>
								<th className="pb-8 pl-20">Sum</th>
							</tr>
						</thead>
						<tbody>
							{monthAndYear.weeks().map((week) => (
								<tr key={week.week}>
									<th scope="row" className="pr-12">
										{week.week}
									</th>
									{week.days().map((day) => (
										<Td
											key={day.month() + day.date()}
											textColor={
												monthAndYear.contains(day) ? "svart" : "grå700"
											}
											backgroundColor={
												dayAllGood(day) ? "stålblå200" : "rød300"
											}
										>
											<FlexColumn valign="center">
												{day.date()}
												{day.isSameOrBefore(lockDate) && <Icon type="locked" />}
											</FlexColumn>
										</Td>
									))}
									<Td className="pl-20" style={{ textAlign: "right" }}>
										{week
											.days()
											.reduce((prev, curr) => prev + sumForDay(curr), 0)}
										t
									</Td>
								</tr>
							))}
						</tbody>
					</Table>
				</Container>
				<Container
					padding={{ x: 40, bottom: 20, top: 12 }}
					backgroundColor="stålblå300"
					style={{
						borderBottomLeftRadius: borderRadius.medium,
						borderBottomRightRadius: borderRadius.medium,
					}}
				>
					<FlexRow marginBetween={12} halign="space-between">
						<Button
							icon={<Icon type="arrow" direction="left" />}
							variant="text"
							onClick={() => {
								setMonthAndYear(monthAndYear.previous());
							}}
						>
							Forrige
						</Button>
						<div style={{ textAlign: "center" }}>
							<Text textStyle="bodyBold">
								{monthAndYear.monthName.toUpperCase()}
							</Text>
							<Text textStyle="bodyBold">{monthAndYear.year}</Text>
						</div>
						<Button
							icon={<Icon type="arrow" direction="right" />}
							variant="text"
							iconPlacement="right"
							onClick={() => {
								setMonthAndYear(monthAndYear.next());
							}}
						>
							Neste
						</Button>
					</FlexRow>
				</Container>
			</Modal>
		</>
	);
};

const Table = styled.table`
	border-collapse: collapse;
`;

const Td = styled.td<{ textColor?: ColorType; backgroundColor?: ColorType }>`
	width: 50px;
	height: 50px;
	${textStyles.body};
	color: ${(props) => colorTypeToHex(props.textColor ?? "svart")};
	${(props) =>
		props.backgroundColor &&
		css`
			background-color: ${colorTypeToHex(props.backgroundColor)};
		`}
`;
