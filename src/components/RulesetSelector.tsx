import React from "react";
import { RadioGroup } from "@utdanningsdirektoratet/lisa";
import { RulesetId } from "../rules";
import { useRuleSet } from "../data/useRuleset";
import { P } from "./P";

interface Props {
	className?: string;
}

export const RulesetSelector: React.FC<Props> = ({ className }) => {
	const { rulesets, setRuleSet, selectedRuleset } = useRuleSet();

	return (
		<div className={className}>
			<P>
				Regler bestemmer hvilke issues i Jira som skal føres på hvilke timekoder
				i Bekk.
			</P>
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
		</div>
	);
};
