import { useState } from "react";
import { useRuleSet } from "../data/useRuleset";
import { buildCatalog } from "./catalog";
import { getDraftStorage, loadDrafts } from "./draftStore";

export function usePolicyCatalog() {
	const { rulesets, selectedRuleset } = useRuleSet();
	const [drafts] = useState(() => loadDrafts(getDraftStorage()));
	return buildCatalog([...rulesets.values()], drafts, selectedRuleset?.id);
}
