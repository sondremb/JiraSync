import { Heading } from "@digdir/designsystemet-react";
import React from "react";
import { RulesetSelector } from "./components/RulesetSelector";
import { useRuleSet } from "./data/useRuleset";
import { AppBar } from "./layout/AppBar";
import { Page } from "./layout/Page";

export const RulesetWrapper: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { selectedRuleset } = useRuleSet();

	return (
		<Page header={<AppBar />} tinted>
			{selectedRuleset ? (
				children
			) : (
				<>
					<Heading level={2} data-size="md">
						Velg regler
					</Heading>
					<RulesetSelector />
				</>
			)}
		</Page>
	);
};
