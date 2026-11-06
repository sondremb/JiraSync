import { useRuleSet } from "../data/useRuleset";
import { buildCatalog } from "./catalog";
import { useDrafts } from "./useDrafts";

export function usePolicyCatalog() {
	const { bundled, selectedRuleset } = useRuleSet();
	const drafts = useDrafts();
	return buildCatalog(bundled, drafts, selectedRuleset?.id);
}
