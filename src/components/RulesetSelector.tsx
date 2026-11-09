import React from "react";
import { Fieldset, Paragraph, Radio } from "@digdir/designsystemet-react";
import { useRuleSet } from "../data/useRuleset";
import { type CatalogEntry } from "../policies/catalog";
import { Column } from "../layout/Column";

const kindSuffix: Record<CatalogEntry["kind"], string> = {
	bundled: "",
	draft: " (bare hos deg)",
	edited: " (endret, bare hos deg)",
};

export const RulesetSelector: React.FC = () => {
	const { entries, setRuleSet, selectedRuleset } = useRuleSet();

	return (
		<Column>
			<Paragraph>
				Regler bestemmer hvilke issues i Jira som skal føres på hvilke timekoder
				i Bekk.
			</Paragraph>
			<Fieldset>
				<Fieldset.Legend>Velg regelsett</Fieldset.Legend>
				{entries.map(({ ruleset, kind }) => (
					<Radio
						key={ruleset.id}
						name="ruleset"
						value={ruleset.id}
						label={ruleset.name + kindSuffix[kind]}
						description={ruleset.description || undefined}
						checked={ruleset.id === selectedRuleset?.id}
						onChange={() => setRuleSet(ruleset)}
					/>
				))}
			</Fieldset>
		</Column>
	);
};
