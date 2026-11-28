import React from "react";
import type { LockDate } from "../../reconciliation/entities";
import { Heading, Paragraph, Skeleton } from "@digdir/designsystemet-react";
import { nb } from "date-fns/locale/nb";
import { formatHours, IsoDate } from "../../date-time/IsoWeek";
import type { DayReport } from "../../reconciliation/entities";
import {
	toDayList,
	type DayListDay,
	type DayListLine,
	type DayListUnmatched,
} from "./dayListModel";
import { HoursCell } from "./HoursCell";
import { JiraIssueName } from "./JiraIssueName";
import { LockDateButton } from "./LockDateButton";
import { StatusMark } from "./StatusMark";
import type { WeekStatus } from "./weekStatus";
import { TimecodeName } from "./TimecodeName";
import styles from "./DayList.module.css";
import { classNames } from "../../Utils/classNames";

interface Props {
	className?: string;
	reports: readonly DayReport[];
	lockDate: LockDate;
	status?: WeekStatus;
	onLockDate?: (day: IsoDate) => void;
	pending?: boolean;
}

/** The week as one block per day, for narrow screens. */
export const DayList: React.FC<Props> = ({
	className,
	reports,
	lockDate,
	status,
	onLockDate,
	pending,
}) => {
	const classes = classNames(styles.dayList, className);
	if (pending) return <DayListSkeleton className={classes} />;

	const { items, weekBekkHours } = toDayList(reports, lockDate);
	const today = IsoDate.fromDate(new Date());
	return (
		<div className={classes}>
			<ol className={styles.dayList__days}>
				{items.map((item) =>
					item.kind === "day" ? (
						<Day
							key={item.date}
							day={item}
							today={item.date === today}
							status={status}
							onLockDate={onLockDate}
						/>
					) : (
						<li
							key={item.saturday}
							className={`${styles.dayList__day} ${styles["dayList__day--weekend"]}`}
						>
							<Paragraph className={styles.dayList__weekendLabel}>
								Lør–søn · ingen timer
							</Paragraph>
							{onLockDate && (
								<LockDateButton
									day={item.sunday}
									onClick={() => onLockDate(item.sunday)}
								/>
							)}
						</li>
					),
				)}
			</ol>
			<Paragraph className={styles.dayList__total}>
				Totalt <strong>{formatHours(weekBekkHours)} t</strong>
			</Paragraph>
		</div>
	);
};

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

const weekdayName = (date: IsoDate) =>
	capitalize(IsoDate.format(date, "EEEE", { locale: nb }));

const shortDate = (date: IsoDate) =>
	IsoDate.format(date, "d. MMM", { locale: nb }).replace(/\.$/, "");

const Day: React.FC<{
	day: DayListDay;
	today: boolean;
	status?: WeekStatus;
	onLockDate?: (day: IsoDate) => void;
}> = ({ day, today, status, onLockDate }) => {
	const dayStatus = status?.days[day.date];
	return (
		<li
			className={classNames(
				styles.dayList__day,
				today && styles["dayList__day--today"],
			)}
		>
			<div
				className={classNames(
					styles.dayList__header,
					day.locked && styles["dayList__header--locked"],
				)}
			>
				<Heading level={2} className={styles.dayList__title}>
					<span className={styles.dayList__weekday}>
						{weekdayName(day.date)}
					</span>
					<span className={styles.dayList__date}>
						{shortDate(day.date)}
						{today && <span className="ds-sr-only">, i dag</span>}
					</span>
				</Heading>
				<span className={styles.dayList__hours}>
					{dayStatus && <StatusMark status={dayStatus} />}
					{formatHours(day.bekkHours)} t
				</span>
				{onLockDate && (
					<LockDateButton day={day.date} onClick={() => onLockDate(day.date)} />
				)}
			</div>
			{day.lines.length > 0 || day.unmatched.length > 0 ? (
				<ul className={styles.dayList__lines}>
					{day.lines.map((line) => (
						<Line key={line.id} line={line} />
					))}
					{day.unmatched.map((work) => (
						<UnmatchedLine key={work.issueId} work={work} />
					))}
				</ul>
			) : (
				<Paragraph data-size="sm" className={styles.dayList__empty}>
					ingen timer
				</Paragraph>
			)}
		</li>
	);
};

const Line: React.FC<{ line: DayListLine }> = ({ line }) => (
	<li className={styles.dayList__line}>
		<span className={styles.dayList__timecode}>
			<TimecodeName id={line.id} />
		</span>
		<HoursCell
			state={line.state}
			bekkHours={line.bekkHours}
			jiraHours={line.jiraHours ?? 0}
		/>
	</li>
);

const UnmatchedLine: React.FC<{ work: DayListUnmatched }> = ({ work }) => (
	<li className={styles.dayList__line}>
		<span className={styles.dayList__timecode}>
			<JiraIssueName id={work.issueId} />
			<span className={styles.dayList__unmatchedLabel}>Ingen regel</span>
		</span>
		<HoursCell state="unmatched" bekkHours={0} jiraHours={work.jiraHours} />
	</li>
);

const DayListSkeleton: React.FC<{ className: string }> = ({ className }) => (
	<div className={className} aria-busy>
		<ol className={styles.dayList__days}>
			{[0, 1, 2, 3, 4].map((i) => (
				<li key={i} className={styles.dayList__day}>
					<div className={styles.dayList__header}>
						<Skeleton variant="text" characters={20} />
					</div>
					<div className={styles.dayList__line}>
						<Skeleton variant="text" characters={12} />
						<Skeleton variant="rectangle" width="3.5rem" height="2.5rem" />
					</div>
				</li>
			))}
		</ol>
	</div>
);
