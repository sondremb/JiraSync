import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ruleset, RulesetId } from "../rules";
import {
	oldPasRuleSet,
	newPasRuleSet,
	otherRuleSet,
	newPasDesignRuleSet,
	oldPasDesignRuleSet,
	adrianRuleSet,
	grunnmurRuleSet,
} from "../timecode-map";
import { toMap } from "../Utils/arrayUtils";

export function useRuleSet(): {
	rulesets: Map<RulesetId, Ruleset>;
	selectedRuleset: Ruleset | undefined;
	setRuleSet: (ruleset: Ruleset) => void;
} {
	const rulesets = [
		oldPasRuleSet,
		newPasRuleSet,
		otherRuleSet,
		oldPasDesignRuleSet,
		newPasDesignRuleSet,
		adrianRuleSet,
		grunnmurRuleSet,
	];
	const rulesetsById: Map<RulesetId, Ruleset> = toMap(rulesets, (r) => r.id);

	const rulesetIdFromStorage = localStorage.getItem("selectedRulesetId");
	const initiallySelectedRuleset = rulesets.find(
		(ruleset) => ruleset.id === rulesetIdFromStorage,
	);
	const { data: selectedRulesetData } = useQuery({
		queryKey: ["rulesets", "selected"],
		queryFn: () => {
			return initiallySelectedRuleset;
		},
		staleTime: Infinity,
	});
	const queryClient = useQueryClient();

	return {
		selectedRuleset: selectedRulesetData,
		rulesets: rulesetsById,
		setRuleSet: (ruleset: Ruleset) => {
			localStorage.setItem("selectedRulesetId", ruleset.id);
			queryClient.setQueryData(["rulesets", "selected"], ruleset);
		},
	};
}
