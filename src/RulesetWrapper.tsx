import React from "react";
import { RulesetSelector } from "./components/RulesetSelector";
import { PageLayout } from "@utdanningsdirektoratet/lisa";
import { useRuleSet } from "./data/useRuleset";

export const RulesetWrapper: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const { selectedRuleset } = useRuleSet();

	if (!selectedRuleset) {
		return (
			<PageLayout>
				<RulesetSelector />
			</PageLayout>
		);
	}

	return <>{children}</>;
};
