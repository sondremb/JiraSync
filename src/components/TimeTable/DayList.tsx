import React from "react";
import { Heading, Paragraph, Skeleton } from "@digdir/designsystemet-react";
import {
	CheckmarkCircleFillIcon,
	ExclamationmarkTriangleFillIcon,
} from "@navikt/aksel-icons";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale/nb";
import { formatHours, IsoDate } from "../../date-time/IsoWeek";
import type { DayReport } from "../../reconciliation/entities";
import { toDayList, type DayListDay, type DayListLine } from "./dayListModel";
import { HoursBox } from "./HoursBox";
import { LockDateButton } from "./LockDateButton";
import { TimecodeName } from "./TimecodeName";
import styles from "./DayList.module.css";

interface Props {
	className?: string;
	reports: readonly DayReport[];
	onLockDate?: (day: IsoDate) => void;
	pending?: boolean;
}

/** The week as one block per day, for narrow screens. */
export const DayList: React.FC<Props> = ({
	className,
	reports,
	onLockDate,
	pending,
}) => {
	const classes = [styles.dayList, className ?? ""].filter(Boolean).join(" ");
	if (pending) return <DayListSkeleton className={classes} />;

	const { items, weekBekkHours } = toDayList(reports);
	return (
		<div className={classes}>
			<ol className={styles.dayList__days}>
				{items.map((item) =>
					item.kind === "day" ? (
						<Day key={item.date} day={item} onLockDate={onLockDate} />
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

const dayTitle = (date: IsoDate) => {
	const text = formatDate(IsoDate.toDate(date), "EEEE d. MMM", { locale: nb });
	return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, "");
};

const Day: React.FC<{
	day: DayListDay;
	onLockDate?: (day: IsoDate) => void;
}> = ({ day, onLockDate }) => (
	<li className={styles.dayList__day}>
		<div className={styles.dayList__header}>
			<Heading level={2} data-size="2xs" className={styles.dayList__title}>
				{dayTitle(day.date)} · {formatHours(day.bekkHours)} t
			</Heading>
			{day.inSync ? (
				<CheckmarkCircleFillIcon
					title="Stemmer"
					className={`${styles.dayList__status} ${styles["dayList__status--ok"]}`}
				/>
			) : (
				<ExclamationmarkTriangleFillIcon
					title="Stemmer ikke"
					className={`${styles.dayList__status} ${styles["dayList__status--warning"]}`}
				/>
			)}
			{onLockDate && (
				<LockDateButton day={day.date} onClick={() => onLockDate(day.date)} />
			)}
		</div>
		{day.lines.length > 0 ? (
			<ul className={styles.dayList__lines}>
				{day.lines.map((line) => (
					<Line key={line.id} line={line} />
				))}
			</ul>
		) : (
			<Paragraph data-size="sm" className={styles.dayList__empty}>
				ingen timer
			</Paragraph>
		)}
	</li>
);

const Line: React.FC<{ line: DayListLine }> = ({ line }) => (
	<li className={styles.dayList__line}>
		<span className={styles.dayList__timecode}>
			<TimecodeName id={line.id} />
		</span>
		<HoursBox
			bekkHours={line.bekkHours}
			jiraHours={line.jiraHours}
			mismatch={line.mismatch}
		/>
	</li>
);

const DayListSkeleton: React.FC<{ className: string }> = ({ className }) => (
	<div className={className} aria-busy>
		<ol className={styles.dayList__days}>
			{[0, 1, 2, 3, 4].map((i) => (
				<li key={i} className={styles.dayList__day}>
					<Skeleton variant="text" characters={20} />
					<div className={styles.dayList__line}>
						<Skeleton variant="text" characters={12} />
						<Skeleton variant="rectangle" width="3.125rem" height="3.125rem" />
					</div>
				</li>
			))}
		</ol>
	</div>
);
