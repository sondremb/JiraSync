import { ConfirmModal, FlexColumn, Table, Text } from "@udir/lisa";
import { Moment } from "moment";
import React, { useState } from "react";
import styled from "styled-components";
import { useBekkTimecodes } from "../../data/useBekkTimecodes";
import { useLockDate } from "../../data/useLockDate";
import { isUdir } from "../../timecode-map";
import { BekkTimecodeEntry } from "../../types";
import { dayRange, toDateString } from "../../Utils/dateUtils";
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
	const { lockDate, updateLockDate } = useLockDate();
	const [dateToLock, setDateToLock] = useState<Moment | undefined>();

	if (bekkTimecodes === undefined || lockDate === undefined) return null;

	const dateHeader = (date: Moment) => {
		return (
			<FlexColumn>
				<CapitalText textStyle="labelBold">{date.format("dddd")}</CapitalText>
				<CapitalText textStyle="labelBold">
					{date.format("D. MMMM")}
				</CapitalText>
			</FlexColumn>
		);
	};

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

	const dayAllGood = (day: Moment) => {
		const dateString = toDateString(day);
		return props.entries.every((entry) => {
			if (!isUdir(bekkTimecodes[entry.id])) {
				return true;
			}
			const entryDay = entry.days[dateString];
			return (
				entryDay === undefined || entryDay.bekkHours === entryDay.totalJiraHours
			);
		});
	};

	const onLockClicked = (date: Moment) => {
		if (date.isSameOrBefore(lockDate)) {
			throw Error("Kan ikke låse en allerede låst dag");
		}
		const allGood = dayRange(lockDate.add(1, "day"), date).every(dayAllGood);
		if (allGood) {
			updateLockDate(date);
		} else {
			setDateToLock(date);
		}
	};

	return (
		<>
			<Table
				headerColor="stålblå200"
				columns={[
					{
						headerName: "Kode",
						displayFunction: (row) => <FirstColumnCell row={row} />,
						width: "25%",
					},
					...props.days.map((day: Moment) => ({
						headerName: dateHeader(day),
						displayFunction: (i: Row) => (
							<TimetableCell day={day} row={i} onLockClicked={onLockClicked} />
						),
					})),
					{
						headerName: "Sum",
						displayFunction: (row) => <SumColumnCell row={row} />,
					},
				]}
				items={items}
				rowColor={(row) => (row.kind === "entry" ? "stålblå200" : "skifer500")}
			/>
			<ConfirmModal
				showModal={dateToLock !== undefined}
				onCancel={() => setDateToLock(undefined)}
				title="Bekreft låsing"
				confirmLabel="Ja, lås timene"
				cancelLabel="Avbryt"
				onConfirm={() => {
					updateLockDate(dateToLock!);
					setDateToLock(undefined);
				}}
			>
				Dette vil låse en eller flere dager hvor det ikke er samsvar mellom
				Timekeeper og Jirasync. Er du sikker på at du vil fortsette?
			</ConfirmModal>
		</>
	);
};
