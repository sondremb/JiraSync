import React, { useState } from "react";
import { Button, FlexColumn, FlexRow, Icon, Text } from "@utdanningsdirektoratet/lisa";
import { colors, spacing } from "@utdanningsdirektoratet/lisa-tokens";
import styled from "styled-components";
import { WeeklyReconciliation } from "./components/WeeklyReconciliation";
import { RulesetModal } from "./components/RulesetModal";
import { useLockDate } from "./data/useLockDate";
import { useRuleSet } from "./data/useRuleset";
import { IsoWeek } from "./date-time/IsoWeek";

const CenteredText = styled(Text)`
	text-align: center;
`;

const ColoredRow = styled(FlexRow)`
	background-color: ${colors.skifer500};
	padding: ${spacing(8)};
`;

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
			<FlexRow halign="space-between" className="mb-12">
				<RulesetModal />
			</FlexRow>
			<ColoredRow halign="center" valign="center">
				<Button
					variant="text"
					onClick={onPreviousWeekClick}
					icon={<Icon type="arrow" direction="left" />}
					colorTheme="dark"
				>
					Forrige
				</Button>
				<FlexColumn halign="center" className="mx-40" width={`${55 / 16}rem`}>
					<CenteredText textStyle="bodyBold" textColor="grå100">
						UKE {IsoWeek.toParts(weekAndYear).week}
					</CenteredText>
					<CenteredText textStyle="bodyBold" textColor="grå100">
						{IsoWeek.toParts(weekAndYear).year}
					</CenteredText>
				</FlexColumn>
				<Button
					variant="text"
					onClick={onNextWeekClick}
					icon={<Icon type="arrow" direction="right" />}
					iconPlacement="right"
					colorTheme="dark"
				>
					Neste
				</Button>
			</ColoredRow>
			{selectedRuleset && !lockDateLoading && (
				<WeeklyReconciliation
					key={`${weekAndYear}-${selectedRuleset.id}`}
					week={weekAndYear}
					ruleset={selectedRuleset}
				/>
			)}
		</>
	);
};
