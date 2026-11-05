import { useRuleSet } from "../data/useRuleset";
import { buildCatalog } from "./catalog";
import { useDrafts } from "./useDrafts";

export function usePolicyCatalog() {
	const { rulesets, selectedRuleset } = useRuleSet();
	const drafts = useDrafts();
	return buildCatalog([...rulesets.values()], drafts, selectedRuleset?.id);
}
