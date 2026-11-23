/**
 * PROTOTYPE, throw away. Data and actions shared by the front-page redesign
 * variants (`?variant=B|C` on `/`). Mirrors App.tsx and WeeklyReconciliation.tsx
 * so every variant keeps the same capabilities: week navigation, ruleset
 * choice, sync, preview, lock, logout.
 */
import React, { useState } from "react";
import {
	Avatar,
	Button,
	Dialog,
	Dropdown,
	Heading,
	Paragraph,
	Tag,
} from "@digdir/designsystemet-react";
import { LeaveIcon, TasklistIcon } from "@navikt/aksel-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLockDate } from "../../data/useLockDate";
import { useRuleSet } from "../../data/useRuleset";
import { formatHours, IsoDate, IsoWeek } from "../../date-time/IsoWeek";
import { useBekkAccount } from "../../login/bekk/useBekkAccount";
import { useLogout } from "../../login/useLogout";
import {
	DayReport,
	ManagedTimecodeDayComparison,
} from "../../reconciliation/entities";
import {
	isLocked,
	lockedOutOfSyncDays,
	planSync,
	type ProposedChange,
} from "../../reconciliation/syncPreview";
import {
	reconciliationQueryKey,
	useSyncWeek,
	useWeeklyReconciliation,
} from "../../reconciliation/useWeeklyReconciliation";
import type { Ruleset } from "../../rules";
import { Column } from "../../layout/Column";
import { Row } from "../../layout/Row";
import { RulesetDialog } from "../RulesetModal";
import { TimecodeLabel } from "../TimecodeLabel";
import styles from "./shared.module.css";

export const today = () => IsoDate.fromDate(new Date());

const MONTHS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"mai",
	"jun",
	"jul",
	"aug",
	"sep",
	"okt",
	"nov",
	"des",
];
const WEEKDAYS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

export const weekdayShort = (date: IsoDate) =>
	WEEKDAYS[IsoDate.weekday(date) - 1];
export const dayOfMonth = (date: IsoDate) => Number(date.slice(8, 10));
export const monthShort = (date: IsoDate) =>
	MONTHS[Number(date.slice(5, 7)) - 1];

/** "23.–29. nov" or "30. nov–6. des". */
export const weekRange = (week: IsoWeek) => {
	const monday = IsoWeek.monday(week);
	const sunday = IsoWeek.sunday(week);
	return monthShort(monday) === monthShort(sunday)
		? `${dayOfMonth(monday)}.–${dayOfMonth(sunday)}. ${monthShort(sunday)}`
		: `${dayOfMonth(monday)}. ${monthShort(monday)}–${dayOfMonth(sunday)}. ${monthShort(sunday)}`;
};

/** Week navigation, as in App.tsx. */
export const usePrototypeWeek = () => {
	const { lockDate, isLoading } = useLockDate();
	const initialWeek = lockDate
		? IsoWeek.fromIsoDate(IsoDate.addDays(lockDate, 1))
		: IsoWeek.fromDate(new Date());
	const [startWeek, setStartWeek] = useState<IsoWeek | undefined>();
	if (!isLoading && startWeek === undefined) setStartWeek(initialWeek);
	const [navigated, setNavigated] = useState<IsoWeek | undefined>();
	const week = navigated ?? startWeek ?? initialWeek;
	return {
		week,
		ready: !isLoading,
		next: () => setNavigated(IsoWeek.next(week)),
		previous: () => setNavigated(IsoWeek.previous(week)),
	};
};

export type DayStatus =
	| "empty"
	| "ok"
	| "changes"
	| "locked"
	| "lockedMismatch"
	| "unmatched";

export interface DaySummary {
	date: IsoDate;
	bekkHours: number;
	jiraHours: number;
	locked: boolean;
	status: DayStatus;
	changes: number;
	/** Bekk hours that day after syncing. */
	targetHours: number;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export const summarizeDay = (
	report: DayReport,
	lockDate: IsoDate | undefined,
	changes: readonly ProposedChange[],
): DaySummary => {
	const comparisons = Array.from(report.comparisons.values());
	const bekkHours =
		sum(comparisons.map((c) => c.internalHoursWorked)) +
		sum(report.unmanagedInternals.map((w) => w.hoursWorked));
	const jiraHours = sum(
		comparisons.map((c) => ManagedTimecodeDayComparison.jiraHoursWorked(c)),
	);
	const locked = isLocked(report.date, lockDate);
	const inSync = DayReport.isInSync(report);
	const dayChangeList = changes.filter((c) => c.date === report.date);
	const dayChanges = dayChangeList.length;
	const hasAny = bekkHours !== 0 || jiraHours !== 0 || !inSync;
	const status: DayStatus =
		report.unmatchedJiraWork.length > 0
			? "unmatched"
			: locked
				? inSync
					? "locked"
					: "lockedMismatch"
				: !hasAny
					? "empty"
					: inSync
						? "ok"
						: "changes";
	return {
		date: report.date,
		bekkHours,
		jiraHours,
		locked,
		status,
		changes: dayChanges,
		targetHours:
			bekkHours + sum(dayChangeList.map((c) => c.targetHours - c.currentHours)),
	};
};

/** Everything WeeklyReconciliation.tsx computes and does, as one hook. */
export const useWeekView = (week: IsoWeek, ruleset: Ruleset) => {
	const query = useWeeklyReconciliation(week, ruleset);
	const { data, dataUpdatedAt, isFetching } = query;
	const { lockDate, updateLockDate } = useLockDate();
	const sync = useSyncWeek();
	const queryClient = useQueryClient();
	const [syncedAt, setSyncedAt] = useState<number | null>(null);
	const justSynced = syncedAt !== null && syncedAt === dataUpdatedAt;

	const changes = data ? planSync(data, lockDate) : [];
	const lockedDays = data ? lockedOutOfSyncDays(data, lockDate) : [];
	const unmatchedCount =
		data?.reduce((count, day) => count + day.unmatchedJiraWork.length, 0) ?? 0;
	const days = data?.map((report) => summarizeDay(report, lockDate, changes));

	const runSync = async () => {
		if (sync.isPending) return;
		try {
			await sync.mutateAsync(changes);
			setSyncedAt(
				queryClient.getQueryState(reconciliationQueryKey(week, ruleset))
					?.dataUpdatedAt ?? null,
			);
		} catch {
			// Shown from `sync.error`.
		}
	};

	return {
		...query,
		lockDate,
		changes,
		lockedDays,
		unmatchedCount,
		days,
		justSynced,
		sync,
		runSync,
		busy: isFetching || sync.isPending,
		updateLockDate,
		lock: (day: IsoDate) => {
			if (!updateLockDate.isPending) updateLockDate.mutate(day);
		},
	};
};

export type WeekView = ReturnType<typeof useWeekView>;

export const groupByDate = (
	changes: readonly ProposedChange[],
): [IsoDate, ProposedChange[]][] => {
	const groups = new Map<IsoDate, ProposedChange[]>();
	for (const change of changes) {
		groups.set(change.date, [...(groups.get(change.date) ?? []), change]);
	}
	return Array.from(groups);
};

/** The proposed changes, grouped by day. */
export const ChangeList: React.FC<{ changes: readonly ProposedChange[] }> = ({
	changes,
}) => (
	<div className={styles.changeList}>
		{groupByDate(changes).map(([date, dayChanges]) => (
			<section key={date} className={styles.changeList__day}>
				<Heading level={3} data-size="2xs">
					{IsoDate.formatLong(date)}
				</Heading>
				<ul className={styles.changeList__items}>
					{dayChanges.map((change) => (
						<li key={change.timecodeId} className={styles.changeList__item}>
							<span className={styles.changeList__code}>
								<TimecodeLabel timecodeId={change.timecodeId} />
							</span>
							<span className={styles.changeList__hours}>
								<span className={styles.changeList__from}>
									{formatHours(change.currentHours)}
								</span>
								→<strong>{formatHours(change.targetHours)} t</strong>
							</span>
						</li>
					))}
				</ul>
			</section>
		))}
	</div>
);

export const PreviewDialog: React.FC<{
	view: WeekView;
	open: boolean;
	onClose: () => void;
}> = ({ view, open, onClose }) => (
	<Dialog open={open} onClose={onClose} closedby="any">
		<Column>
			<Heading level={2} data-size="sm">
				Forslag til synkronisering
			</Heading>
			<Paragraph>
				Oppdaterer følgende Bekk-timer til å stemme overens med Jira-timeføring:
			</Paragraph>
			<ChangeList changes={view.changes} />
			<Row>
				<Button
					loading={view.sync.isPending}
					onClick={() => {
						void view.runSync().then(onClose);
					}}
				>
					Oppdater Bekk-timer
				</Button>
				<Button variant="secondary" onClick={onClose}>
					Avbryt
				</Button>
			</Row>
		</Column>
	</Dialog>
);

const initials = (name: string | undefined) =>
	(name ?? "?")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

/** Slim app bar: wordmark, ruleset, avatar menu with ruleset choice and logout. */
export const AppBar: React.FC = () => {
	const { name } = useBekkAccount();
	const logout = useLogout();
	const { entries } = useRuleSet();
	const selected = entries.find((entry) => entry.isSelected);
	const [rulesetOpen, setRulesetOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className={styles.appBar}>
			<div className={styles.appBar__brand}>
				<span className={styles.appBar__logo} aria-hidden>
					⇄
				</span>
				<span className={styles.appBar__name}>Jirasync</span>
			</div>
			<div className={styles.appBar__right}>
				{selected && (
					<button
						type="button"
						className={styles.appBar__ruleset}
						onClick={() => setRulesetOpen(true)}
						title="Velg regler"
					>
						<TasklistIcon aria-hidden />
						<span>{selected.ruleset.name}</span>
						{selected.kind !== "bundled" && (
							<Tag data-color="warning" data-size="sm">
								bare hos deg
							</Tag>
						)}
					</button>
				)}
				<Dropdown.TriggerContext>
					<Dropdown.Trigger
						variant="tertiary"
						className={styles.appBar__avatarButton}
						aria-label="Meny"
					>
						<Avatar aria-label={name ?? "Bruker"} data-size="sm">
							{initials(name)}
						</Avatar>
					</Dropdown.Trigger>
					<Dropdown
						placement="bottom-end"
						open={menuOpen}
						onOpen={() => setMenuOpen(true)}
						onClose={() => setMenuOpen(false)}
					>
						{name && <Dropdown.Heading>{name}</Dropdown.Heading>}
						<Dropdown.List>
							<Dropdown.Item>
								<Dropdown.Button
									onClick={() => {
										setMenuOpen(false);
										setRulesetOpen(true);
									}}
								>
									<TasklistIcon aria-hidden />
									Velg regler
								</Dropdown.Button>
							</Dropdown.Item>
							<Dropdown.Item>
								<Dropdown.Button
									onClick={() => {
										setMenuOpen(false);
										void logout();
									}}
								>
									<LeaveIcon aria-hidden />
									Logg ut
								</Dropdown.Button>
							</Dropdown.Item>
						</Dropdown.List>
					</Dropdown>
				</Dropdown.TriggerContext>
			</div>
			<RulesetDialog open={rulesetOpen} onClose={() => setRulesetOpen(false)} />
		</header>
	);
};
