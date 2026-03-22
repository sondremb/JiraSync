import React from "react";
import { RulesetSelector } from "./components/RulesetSelector";
import { FlexRow, H1, PageLayout } from "@utdanningsdirektoratet/lisa";
import { useRuleSet } from "./data/useRuleset";
import { Example } from "./components/TimeTable/timetable-cell";
import { LoginStatus } from "./login/LoginStatus";

export const RulesetWrapper: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const { selectedRuleset } = useRuleSet();

	return (
		<PageLayout>
			<FlexRow valign="center" halign="space-between" className="mb-20">
				<FlexRow>
					<H1 textStyle="display" className="mb-0 mr-40">
						Jirasync
					</H1>
					<Example />
				</FlexRow>
				<LoginStatus />
			</FlexRow>
			{selectedRuleset ? children : <RulesetSelector />}
		</PageLayout>
	);
};
