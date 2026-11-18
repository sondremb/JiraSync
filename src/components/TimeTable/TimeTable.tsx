import React from "react";
import { Skeleton, Table } from "@digdir/designsystemet-react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale/nb";
import { IsoDate } from "../../date-time/IsoWeek";
import { GridEntry } from "./gridModel";
import { HoursBox } from "./HoursBox";
import { LockDateButton } from "./LockDateButton";
import { TimecodeName } from "./TimecodeName";
import styles from "./TimeTable.module.css";

interface Props {
	className?: string;
	entries: GridEntry[];
	days: IsoDate[];
	onLockDate?: (day: IsoDate) => void;
	pending?: boolean;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const bekkHoursOn = (entries: GridEntry[], day: IsoDate) =>
	sum(entries.map((entry) => entry.days[day]?.bekkHours ?? 0));

const weekBekkHours = (entry: GridEntry) =>
	sum(Object.values(entry.days).map((day) => day?.bekkHours ?? 0));

export const TimeTable: React.FC<Props> = ({
	className,
	entries,
	days,
	onLockDate,
	pending,
}) => {
	const sorted = [...entries].sort(
		(a, b) => Number(b.managed) - Number(a.managed),
	);
	const hoursCell = styles["timeTable__cell--hours"];

	return (
		<div
			className={[styles.timeTable, className ?? ""].filter(Boolean).join(" ")}
		>
			<Table className={styles.timeTable__table}>
				<Table.Head>
					<Table.Row>
						<Table.HeaderCell className={styles.timeTable__code}>
							Kode
						</Table.HeaderCell>
						{days.map((day) => (
							<Table.HeaderCell key={day} className={hoursCell}>
								<DayHeader day={day} />
							</Table.HeaderCell>
						))}
						<Table.HeaderCell className={hoursCell}>Sum</Table.HeaderCell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{pending
						? [0, 1].map((i) => <SkeletonRow key={i} days={days} />)
						: sorted.map((entry) => (
								<Table.Row key={entry.id}>
									<Table.Cell>
										<TimecodeName id={entry.id} />
									</Table.Cell>
									{days.map((day) => (
										<Table.Cell key={day} className={hoursCell}>
											<EntryHours entry={entry} day={day} />
										</Table.Cell>
									))}
									<Table.Cell
										className={`${hoursCell} ${styles["timeTable__cell--total"]}`}
									>
										{weekBekkHours(entry)}
									</Table.Cell>
								</Table.Row>
							))}
				</Table.Body>
				<Table.Foot className={styles.timeTable__foot}>
					{pending ? (
						<SkeletonRow days={days} />
					) : (
						<>
							<Table.Row>
								<Table.HeaderCell scope="row">Totalt</Table.HeaderCell>
								{days.map((day) => (
									<Table.Cell
										key={day}
										className={`${hoursCell} ${styles["timeTable__cell--total"]}`}
									>
										{bekkHoursOn(entries, day)}
									</Table.Cell>
								))}
								<Table.Cell
									className={`${hoursCell} ${styles["timeTable__cell--total"]}`}
								>
									{sum(entries.map(weekBekkHours))}
								</Table.Cell>
							</Table.Row>
							{onLockDate && (
								<Table.Row>
									<Table.Cell />
									{days.map((day) => (
										<Table.Cell key={day} className={hoursCell}>
											<LockDateButton
												day={day}
												onClick={() => onLockDate(day)}
											/>
										</Table.Cell>
									))}
									<Table.Cell />
								</Table.Row>
							)}
						</>
					)}
				</Table.Foot>
			</Table>
		</div>
	);
};

const DayHeader: React.FC<{ day: IsoDate }> = ({ day }) => {
	const date = IsoDate.toDate(day);
	return (
		<span className={styles.timeTable__day}>
			<span>{formatDate(date, "EEEE", { locale: nb })}</span>
			<span>{formatDate(date, "d. MMMM", { locale: nb })}</span>
		</span>
	);
};

const EntryHours: React.FC<{ entry: GridEntry; day: IsoDate }> = ({
	entry,
	day,
}) => {
	const hours = entry.days[day];
	const hasHours =
		hours !== undefined &&
		(hours.bekkHours !== 0 || hours.totalJiraHours !== 0);
	return (
		<HoursBox
			bekkHours={hasHours ? hours.bekkHours : undefined}
			jiraHours={hasHours && entry.managed ? hours.totalJiraHours : undefined}
			mismatch={entry.managed && hours?.bekkHours !== hours?.totalJiraHours}
		/>
	);
};

const SkeletonRow: React.FC<{ days: IsoDate[] }> = ({ days }) => (
	<Table.Row>
		<Table.Cell>
			<Skeleton variant="text" characters={12} />
		</Table.Cell>
		{days.map((day) => (
			<Table.Cell key={day} className={styles["timeTable__cell--hours"]}>
				<Skeleton variant="rectangle" width="3.125rem" height="3.125rem" />
			</Table.Cell>
		))}
		<Table.Cell className={styles["timeTable__cell--hours"]}>
			<Skeleton variant="text" characters={2} />
		</Table.Cell>
	</Table.Row>
);
