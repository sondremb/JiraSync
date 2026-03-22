import React from "react";
import { RadioGroup } from "@utdanningsdirektoratet/lisa";
import { RulesetId } from "../rules";
import { useRuleSet } from "../data/useRuleset";

export const RulesetSelector: React.FC = () => {
	const { rulesets, setRuleSet, selectedRuleset } = useRuleSet();

	return (
		<RadioGroup
			title={"Velg regelsett"}
			onChange={(selectedValue: string) => {
				setRuleSet(rulesets[selectedValue as RulesetId]);
			}}
			items={Object.values(rulesets).map((ruleset) => ({
				value: ruleset.id,
				label: ruleset.name + " - " + ruleset.description,
			}))}
			value={selectedRuleset?.id ?? ""}
		/>
	);
};
