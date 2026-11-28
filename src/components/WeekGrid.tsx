import React from "react";
import type { LockDate } from "../reconciliation/entities";
import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
import type { DayReport } from "../reconciliation/entities";
import { TimeTable } from "./TimeTable/TimeTable";
import { DayList } from "./TimeTable/DayList";
import { toGridEntries, toUnmatchedRows } from "./TimeTable/gridModel";
import type { WeekStatus } from "./TimeTable/weekStatus";
import styles from "./WeekGrid.module.css";

interface Props {
	week: IsoWeek;
	/** Undefined while loading. */
	reports: readonly DayReport[] | undefined;
	lockDate: LockDate;
	status?: WeekStatus;
	onLockDate?: (day: IsoDate) => void;
}

/** The week as a table on wide screens and as a day list on narrow ones. */
export const WeekGrid: React.FC<Props> = ({
	week,
	reports,
	lockDate,
	status,
	onLockDate,
}) => (
	<div className={styles.weekGrid}>
		<TimeTable
			pending={reports === undefined}
			className={styles.weekGrid__table}
			entries={reports ? toGridEntries(reports) : []}
			unmatched={reports ? toUnmatchedRows(reports) : []}
			days={reports ? reports.map((report) => report.date) : IsoWeek.days(week)}
			lockDate={lockDate}
			status={status}
			onLockDate={onLockDate}
		/>
		<DayList
			pending={reports === undefined}
			className={styles.weekGrid__list}
			reports={reports ?? []}
			lockDate={lockDate}
			status={status}
			onLockDate={onLockDate}
		/>
	</div>
);
