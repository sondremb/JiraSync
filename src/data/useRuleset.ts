import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Ruleset } from "../rules";
import { loadPolicies } from "../policies/schema";
import policiesJson from "../policies/policies.json";
import {
	buildCatalog,
	resolveSelected,
	type CatalogEntry,
} from "../policies/catalog";
import { useDrafts } from "../policies/useDrafts";

const bundledRulesets = loadPolicies(policiesJson);

const selectedIdStorageKey = "selectedRulesetId";
const selectedIdQueryKey = ["rulesets", "selectedId"];

function readSelectedId(): string | null {
	try {
		return localStorage.getItem(selectedIdStorageKey);
	} catch {
		return null;
	}
}

function writeSelectedId(id: string) {
	try {
		localStorage.setItem(selectedIdStorageKey, id);
	} catch {
		// Blocked storage: the selection then only lasts for this page load.
	}
}

/**
 * Bundled rulesets merged with local drafts, and the user's selected ruleset.
 *
 * Selection is stored by id, so it follows edits to a selected draft. A draft
 * with a bundled id overrides the bundled ruleset; deleting it falls back to the
 * bundled one. If the selected draft is deleted, `selectedRuleset` is undefined.
 */
export function useRuleSet(): {
	bundled: readonly Ruleset[];
	/** Bundled and draft rulesets in a stable order, for pickers. */
	entries: CatalogEntry[];
	selectedRuleset: Ruleset | undefined;
	setRuleSet: (ruleset: Ruleset) => void;
} {
	const drafts = useDrafts();
	const queryClient = useQueryClient();
	const { data: selectedId } = useQuery({
		queryKey: selectedIdQueryKey,
		queryFn: readSelectedId,
		initialData: readSelectedId,
		staleTime: Infinity,
	});
	const selectedRuleset = resolveSelected(bundledRulesets, drafts, selectedId);

	return {
		bundled: bundledRulesets,
		// Built without a selection so the order doesn't jump when the user picks one.
		entries: buildCatalog(bundledRulesets, drafts, undefined).map((entry) => ({
			...entry,
			isSelected: entry.ruleset.id === selectedRuleset?.id,
		})),
		selectedRuleset,
		setRuleSet: (ruleset: Ruleset) => {
			writeSelectedId(ruleset.id);
			queryClient.setQueryData(selectedIdQueryKey, ruleset.id);
		},
	};
}
