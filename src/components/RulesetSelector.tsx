import React from "react";
import { RadioGroup } from "@utdanningsdirektoratet/lisa";
import { useRuleSet } from "../data/useRuleset";
import { type CatalogEntry } from "../policies/catalog";
import { P } from "./P";

interface Props {
	className?: string;
}

const kindSuffix: Record<CatalogEntry["kind"], string> = {
	bundled: "",
	draft: " (bare hos deg)",
	edited: " (endret, bare hos deg)",
};

function label({ ruleset, kind }: CatalogEntry): string {
	const description = ruleset.description ? " - " + ruleset.description : "";
	return ruleset.name + kindSuffix[kind] + description;
}

export const RulesetSelector: React.FC<Props> = ({ className }) => {
	const { entries, setRuleSet, selectedRuleset } = useRuleSet();

	return (
		<div className={className}>
			<P>
				Regler bestemmer hvilke issues i Jira som skal føres på hvilke timekoder
				i Bekk.
			</P>
			<RadioGroup
				title={"Velg regelsett"}
				onChange={(selectedValue: string) => {
					const entry = entries.find((e) => e.ruleset.id === selectedValue);
					if (entry) setRuleSet(entry.ruleset);
				}}
				items={entries.map((entry) => ({
					value: entry.ruleset.id,
					label: label(entry),
				}))}
				value={selectedRuleset?.id ?? ""}
			/>
		</div>
	);
};
