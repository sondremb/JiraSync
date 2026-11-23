import React, { useState } from "react";
import {
	WeeklyReconciliation,
	WeeklyReconciliationPending,
} from "./components/WeeklyReconciliation";
import { RulesetBar } from "./components/RulesetBar";
import { AnnouncementBanner } from "./announcements/AnnouncementBanner";
import { useLockDate } from "./data/useLockDate";
import { useRuleSet } from "./data/useRuleset";
import { rulesetKey } from "./policies/catalog";
import { IsoWeek } from "./date-time/IsoWeek";

interface Props {
	initialWeek: IsoWeek;
}

export const App: React.FC<Props> = ({ initialWeek }) => {
	const { isLoading: lockDateLoading } = useLockDate();
	const { selectedRuleset } = useRuleSet();
	// Start on the week after the lock date, but only the first time it loads:
	// locking a week later must not move the user's view.
	const [startWeek, setStartWeek] = useState<IsoWeek | undefined>();
	if (!lockDateLoading && startWeek === undefined) setStartWeek(initialWeek);
	const [navigatedWeek, setNavigatedWeek] = useState<IsoWeek | undefined>();
	const weekAndYear = navigatedWeek ?? startWeek ?? initialWeek;

	const onNextWeekClick = () => setNavigatedWeek(IsoWeek.next(weekAndYear));
	const onPreviousWeekClick = () =>
		setNavigatedWeek(IsoWeek.previous(weekAndYear));

	return (
		<>
			<AnnouncementBanner />
			<RulesetBar />
			{lockDateLoading ? (
				<WeeklyReconciliationPending
					week={weekAndYear}
					onPreviousWeek={onPreviousWeekClick}
					onNextWeek={onNextWeekClick}
				/>
			) : (
				selectedRuleset && (
					<WeeklyReconciliation
						key={`${weekAndYear}-${rulesetKey(selectedRuleset)}`}
						week={weekAndYear}
						ruleset={selectedRuleset}
						onPreviousWeek={onPreviousWeekClick}
						onNextWeek={onNextWeekClick}
					/>
				)
			)}
		</>
	);
};
