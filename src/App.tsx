import { Heading } from "@digdir/designsystemet-react";
import React, { useState } from "react";
import {
	WeeklyReconciliation,
	WeeklyReconciliationPending,
} from "./components/WeeklyReconciliation";
import { RulesetBar } from "./components/RulesetBar";
import { RulesetSelector } from "./components/RulesetSelector";
import { AnnouncementBanner } from "./announcements/AnnouncementBanner";
import { useLockDate } from "./data/useLockDate";
import { useRuleSet } from "./data/useRuleset";
import { AppBar } from "./layout/AppBar";
import { Page } from "./layout/Page";
import { rulesetKey } from "./policies/catalog";
import { IsoWeek } from "./date-time/IsoWeek";
import { LockDate } from "./reconciliation/entities";

export const App: React.FC = () => {
	const { lockDate, error, isLoading: lockDateLoading } = useLockDate();
	const { selectedRuleset } = useRuleSet();
	const initialWeek = LockDate.startWeek(lockDate, new Date());
	// Fix the start week once the lock date first finishes loading. Locking a
	// week later must not move the user's view.
	const [startWeek, setStartWeek] = useState<IsoWeek | undefined>();
	if (!lockDateLoading && startWeek === undefined) setStartWeek(initialWeek);
	const [navigatedWeek, setNavigatedWeek] = useState<IsoWeek | undefined>();
	const weekAndYear = navigatedWeek ?? startWeek ?? initialWeek;

	const onNextWeekClick = () => setNavigatedWeek(IsoWeek.next(weekAndYear));
	const onPreviousWeekClick = () =>
		setNavigatedWeek(IsoWeek.previous(weekAndYear));

	if (!selectedRuleset) {
		return (
			<Page header={<AppBar />} tinted>
				<Heading level={2} data-size="md">
					Velg regler
				</Heading>
				<RulesetSelector />
			</Page>
		);
	}

	return (
		<Page header={<AppBar />} tinted>
			{error && <p role="alert">Kunne ikke hente låsedato: {error.message}</p>}
			<AnnouncementBanner />
			<RulesetBar />
			{/* Gate on the first load only: a refetch (e.g. after an error, when
			    WeeklyReconciliation mounts) must not unmount the table again. */}
			{startWeek === undefined ? (
				<WeeklyReconciliationPending
					week={weekAndYear}
					onPreviousWeek={onPreviousWeekClick}
					onNextWeek={onNextWeekClick}
				/>
			) : (
				<WeeklyReconciliation
					key={`${weekAndYear}-${rulesetKey(selectedRuleset)}`}
					week={weekAndYear}
					ruleset={selectedRuleset}
					onPreviousWeek={onPreviousWeekClick}
					onNextWeek={onNextWeekClick}
					onShowWeek={setNavigatedWeek}
				/>
			)}
		</Page>
	);
};
