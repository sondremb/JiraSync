import React from "react";
import { LockDate } from "../../reconciliation/entities";
import { Skeleton } from "@digdir/designsystemet-react";
import { nb } from "date-fns/locale/nb";
import { formatHours, IsoDate } from "../../date-time/IsoWeek";
import { cellState, type GridEntry } from "./gridModel";
import { HoursCell } from "./HoursCell";
import { LockDateButton } from "./LockDateButton";
import { StatusMark } from "./StatusMark";
import { TimecodeName } from "./TimecodeName";
import type { WeekStatus } from "./weekStatus";
import styles from "./TimeTable.module.css";
import { classNames } from "../../Utils/classNames";

interface Props {
	className?: string;
	entries: GridEntry[];
	days: IsoDate[];
	lockDate: LockDate;
	/** Status dots on the totals row. */
	status?: WeekStatus;
	onLockDate?: (day: IsoDate) => void;
	pending?: boolean;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const bekkHoursOn = (entries: GridEntry[], day: IsoDate) =>
	sum(entries.map((entry) => entry.days[day]?.bekkHours ?? 0));

const weekBekkHours = (entry: GridEntry) =>
	sum(Object.values(entry.days).map((day) => day?.bekkHours ?? 0));

const SATURDAY = 6;

/** The week as a grid of timecodes by days, for wide screens. */
export const TimeTable: React.FC<Props> = ({
	className,
	entries,
	days,
	lockDate,
	status,
	onLockDate,
	pending,
}) => {
	const sorted = [...entries].sort(
		(a, b) => Number(b.managed) - Number(a.managed),
	);
	const today = IsoDate.fromDate(new Date());
	const dayClass = (day: IsoDate) =>
		classNames(
			styles.timeTable__day,
			IsoDate.weekday(day) >= SATURDAY && styles["timeTable__day--weekend"],
			// Unknown while pending, and an unknown lock date would lock every day.
			!pending &&
				LockDate.isLocked(lockDate, day) &&
				styles["timeTable__day--locked"],
			day === today && styles["timeTable__day--today"],
		);

	return (
		<table
			className={classNames(styles.timeTable, className)}
			aria-busy={pending || undefined}
		>
			<thead>
				<tr>
					<th scope="col" className={styles.timeTable__label}>
						Timekode
					</th>
					{days.map((day) => (
						<th key={day} scope="col" className={dayClass(day)}>
							<DayHeader
								day={day}
								today={day === today}
								onLockDate={onLockDate}
							/>
						</th>
					))}
					<th scope="col" className={styles.timeTable__label}>
						Sum
					</th>
				</tr>
			</thead>
			<tbody>
				{pending
					? [0, 1].map((i) => <SkeletonRow key={i} days={days} />)
					: sorted.map((entry) => (
							<tr
								key={entry.id}
								className={
									entry.managed
										? undefined
										: styles["timeTable__row--unmanaged"]
								}
							>
								<th scope="row" className={styles.timeTable__code}>
									<TimecodeName id={entry.id} />
								</th>
								{days.map((day) => (
									<td key={day} className={dayClass(day)}>
										<HoursCell
											state={cellState(
												entry.days[day],
												entry.managed,
												LockDate.isLocked(lockDate, day),
											)}
											bekkHours={entry.days[day]?.bekkHours ?? 0}
											jiraHours={entry.days[day]?.totalJiraHours ?? 0}
										/>
									</td>
								))}
								<td className={styles.timeTable__sum}>
									{formatHours(weekBekkHours(entry))}
								</td>
							</tr>
						))}
			</tbody>
			{!pending && (
				<tfoot>
					<tr>
						<th scope="row" className={styles.timeTable__code}>
							Totalt
						</th>
						{days.map((day) => (
							<td
								key={day}
								className={`${dayClass(day)} ${styles.timeTable__total}`}
							>
								<span className={styles.timeTable__totalValue}>
									{status?.days[day] && (
										<StatusMark status={status.days[day]} />
									)}
									{formatHours(bekkHoursOn(entries, day))}
								</span>
							</td>
						))}
						<td
							className={`${styles.timeTable__sum} ${styles.timeTable__total}`}
						>
							{formatHours(sum(entries.map(weekBekkHours)))}
						</td>
					</tr>
				</tfoot>
			)}
		</table>
	);
};

const DayHeader: React.FC<{
	day: IsoDate;
	today: boolean;
	onLockDate?: (day: IsoDate) => void;
}> = ({ day, today, onLockDate }) => (
	<span className={styles.timeTable__dayHeader}>
		<span className={styles.timeTable__weekday}>
			{IsoDate.format(day, "EEE", { locale: nb }).replace(/\.$/, "")}
		</span>
		<span className={styles.timeTable__date}>
			{IsoDate.format(day, "d", { locale: nb })}
			<span className="ds-sr-only">
				. {IsoDate.format(day, "MMMM", { locale: nb })}
				{today ? ", i dag" : ""}
			</span>
		</span>
		{onLockDate && LockDate.canLockThrough(day) && (
			<LockDateButton day={day} onClick={() => onLockDate(day)} />
		)}
	</span>
);

const SkeletonRow: React.FC<{ days: IsoDate[] }> = ({ days }) => (
	<tr>
		<th scope="row" className={styles.timeTable__code}>
			<Skeleton variant="text" characters={12} />
		</th>
		{days.map((day) => (
			<td key={day}>
				<Skeleton variant="rectangle" width="3.5rem" height="2.5rem" />
			</td>
		))}
		<td>
			<Skeleton variant="text" characters={2} />
		</td>
	</tr>
);
