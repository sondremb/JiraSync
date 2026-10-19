import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Ruleset, type RulesetId } from "../rules";
import { loadPolicies } from "../policies/schema";
import policiesJson from "../policies/policies.json";
import { toMap } from "../Utils/arrayUtils";

const rulesets = loadPolicies(policiesJson);

export function useRuleSet(): {
	rulesets: Map<RulesetId, Ruleset>;
	selectedRuleset: Ruleset | undefined;
	setRuleSet: (ruleset: Ruleset) => void;
} {
	const rulesetsById: Map<RulesetId, Ruleset> = toMap(rulesets, (r) => r.id);

	const rulesetIdFromStorage = localStorage.getItem("selectedRulesetId");
	const initiallySelectedRuleset = rulesets.find(
		(ruleset) => ruleset.id === rulesetIdFromStorage,
	);
	const { data: selectedRulesetData } = useQuery({
		queryKey: ["rulesets", "selected"],
		queryFn: () => initiallySelectedRuleset,
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
