import { FlexColumn, Table, Text } from "@utdanningsdirektoratet/lisa";
import React from "react";
import styled from "styled-components";
import {
	FirstColumnCell,
	SumColumnCell,
	TimetableCell,
} from "./timetable-cell";
import { IsoDate } from "../../date-time/IsoWeek";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale/nb";
import { GridEntry } from "./gridModel";
import { LockDateButton } from "./LockDateButton";

interface Props {
	entries: GridEntry[];
	days: IsoDate[];
	onLockDate?: (day: IsoDate) => void;
}

const CapitalText = styled(Text)`
	text-transform: capitalize;
`;

export type Row =
	| {
			kind: "entry";
			entry: GridEntry;
	  }
	| {
			kind: "sum";
			entries: GridEntry[];
	  }
	| {
			kind: "lock";
	  };

export const TimeTable: React.FC<Props> = (props) => {
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

	const rows: Row[] = [...props.entries]
		.sort((a, b) => Number(b.managed) - Number(a.managed))
		.map((entry) => ({ kind: "entry", entry }));
	const lockRow: Row[] = props.onLockDate ? [{ kind: "lock" }] : [];
	const items: Row[] = [
		...rows,
		{ kind: "sum", entries: props.entries },
		...lockRow,
	];

	return (
		<Table
			headerColor="stålblå200"
			columns={[
				{
					headerName: "Kode",
					displayFunction: (row) =>
						row.kind === "lock" ? <></> : <FirstColumnCell row={row} />,
					width: "25%",
				},
				...props.days.map((day: IsoDate) => ({
					headerName: dateHeader(day),
					displayFunction: (i: Row) => {
						if (i.kind === "lock") {
							return props.onLockDate ? (
								<LockDateButton
									day={day}
									onClick={() => props.onLockDate!(day)}
								/>
							) : (
								<></>
							);
						}
						return <TimetableCell day={day} row={i} />;
					},
				})),
				{
					headerName: "Sum",
					displayFunction: (row) =>
						row.kind === "lock" ? <></> : <SumColumnCell row={row} />,
				},
			]}
			items={items}
			rowColor={(row) => (row.kind === "entry" ? "stålblå200" : "skifer500")}
		/>
	);
};
