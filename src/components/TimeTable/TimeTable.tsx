import { ConfirmModal, FlexColumn, Table, Text } from "@udir/lisa";
import React, { useState } from "react";
import styled from "styled-components";
import { useLockDate } from "../../data/useLockDate";
import { isUdir } from "../../timecode-map";
import { BekkTimecodeEntry } from "../../types";
import {
	FirstColumnCell,
	SumColumnCell,
	TimetableCell,
} from "./timetable-cell";
import { IsoDate } from "../../date-time/IsoWeek";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale/nb";

interface Props {
	entries: BekkTimecodeEntry[];
	days: IsoDate[];
	lockDate: IsoDate;
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
			lockDate: IsoDate;
	  };

export const TimeTable: React.FC<Props> = (props) => {
	const { lockDate, updateLockDate } = useLockDate();
	const [dateToLock, setDateToLock] = useState<IsoDate | undefined>();

	if (lockDate === undefined) return null;

	const dateHeader = (date: IsoDate) => {
		const dateAsDate = IsoDate.toDate(date);
		return (
			<FlexColumn>
				<CapitalText textStyle="labelBold">
					{formatDate(dateAsDate, "EEEE", { locale: nb })}
				</CapitalText>
				<CapitalText textStyle="labelBold">
					{formatDate(dateAsDate, "d. MMMM", { locale: nb })}
				</CapitalText>
			</FlexColumn>
		);
	};

	const compareTimecodesByUdir = (
		a: BekkTimecodeEntry,
		b: BekkTimecodeEntry
	): number => {
		const isAUdir = isUdir(a.id);
		const isBUdir = isUdir(b.id);
		if (isAUdir && !isBUdir) return -1;
		if (!isAUdir && isBUdir) return 1;
		return 0;
	};

	// TODO: hadde vært digg å få inn alfabetisk sortering igjen
	const rows: Row[] = props.entries
		.sort(compareTimecodesByUdir)
		.map((entry) => ({ kind: "entry", entry }));
	const items: Row[] = [
		...rows,
		{ kind: "sum", entries: props.entries },
		{ kind: "lock", lockDate: props.lockDate },
	];

	const dayAllGood = (day: IsoDate) => {
		return props.entries.every((entry) => {
			if (!isUdir(entry.id)) {
				return true;
			}
			const entryDay = entry.days[day];
			return (
				entryDay === undefined || entryDay.bekkHours === entryDay.totalJiraHours
			);
		});
	};

	const onLockClicked = (date: IsoDate) => {
		if (date <= lockDate) {
			throw Error("Kan ikke låse en allerede låst dag");
		}
		const range = IsoDate.range(lockDate, date);
		const allGood = range.every(dayAllGood);
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
					...props.days.map((day: IsoDate) => ({
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
