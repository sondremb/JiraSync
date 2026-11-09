import React, { useState } from "react";
import { Button, Paragraph } from "@digdir/designsystemet-react";
import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { WeeklyReconciliation } from "./components/WeeklyReconciliation";
import { RulesetBar } from "./components/RulesetBar";
import { useLockDate } from "./data/useLockDate";
import { useRuleSet } from "./data/useRuleset";
import { rulesetKey } from "./policies/catalog";
import { IsoWeek } from "./date-time/IsoWeek";
import styles from "./App.module.css";

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
	const { week, year } = IsoWeek.toParts(weekAndYear);

	const onNextWeekClick = () => setNavigatedWeek(IsoWeek.next(weekAndYear));
	const onPreviousWeekClick = () =>
		setNavigatedWeek(IsoWeek.previous(weekAndYear));

	return (
		<>
			<RulesetBar />
			<nav aria-label="Uke" className={styles.weekNav} data-color-scheme="dark">
				<Button variant="tertiary" onClick={onPreviousWeekClick}>
					<ArrowLeftIcon aria-hidden />
					Forrige
				</Button>
				<div className={styles.weekNav__current} aria-live="polite">
					<Paragraph className={styles.weekNav__label}>UKE {week}</Paragraph>
					<Paragraph className={styles.weekNav__label}>{year}</Paragraph>
				</div>
				<Button variant="tertiary" onClick={onNextWeekClick}>
					Neste
					<ArrowRightIcon aria-hidden />
				</Button>
			</nav>
			{selectedRuleset && !lockDateLoading && (
				<WeeklyReconciliation
					key={`${weekAndYear}-${rulesetKey(selectedRuleset)}`}
					week={weekAndYear}
					ruleset={selectedRuleset}
				/>
			)}
		</>
	);
};
