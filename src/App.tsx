import React, { useEffect, useRef, useState } from "react";
import { Button, FlexColumn, FlexRow, Icon, Text } from "@utdanningsdirektoratet/lisa";
import { colors, spacing } from "@utdanningsdirektoratet/lisa-tokens";
import { addDays } from "date-fns";
import styled from "styled-components";
import { WeeklyReconciliation } from "./components/WeeklyReconciliation";
import { RulesetModal } from "./components/RulesetModal";
import { useLockDate } from "./data/useLockDate";
import { useRuleSet } from "./data/useRuleset";
import { IsoWeek } from "./date-time/IsoWeek";
import { CopyTokenButton } from "./login/bekk/CopyTokenButton";
import { config } from "./Utils/envUtils";

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
	const { lockDate } = useLockDate();
	const { selectedRuleset } = useRuleSet();
	const [weekAndYear, setWeekAndYear] = useState<IsoWeek>(initialWeek);
	const navigated = useRef(false);
	const initialLockDateApplied = useRef(false);

	useEffect(() => {
		if (lockDate === undefined || navigated.current || initialLockDateApplied.current) return;
		setWeekAndYear(IsoWeek.fromDate(addDays(new Date(lockDate), 1)));
		initialLockDateApplied.current = true;
	}, [lockDate]);

	const onNextWeekClick = () => {
		navigated.current = true;
		setWeekAndYear((old) => IsoWeek.next(old));
	};

	const onPreviousWeekClick = () => {
		navigated.current = true;
		setWeekAndYear((old) => IsoWeek.previous(old));
	};

	return (
		<>
			<FlexRow halign="space-between" className="mb-12">
				<RulesetModal />
				{config.debug && <CopyTokenButton />}
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
			{selectedRuleset && (
				<WeeklyReconciliation
					key={`${weekAndYear}-${selectedRuleset.id}`}
					week={weekAndYear}
					ruleset={selectedRuleset}
				/>
			)}
		</>
	);
};
