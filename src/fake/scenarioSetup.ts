import { writeSelectedId } from "../data/useRuleset";
import { jiraAuthenticationContext } from "../login/jira/authContext";
import { deleteDraft, saveDraft } from "../policies/draftStore";
import { getSafeStorage } from "../Utils/safeStorage";
import { fakeLocalRuleset, fixtureRulesetId } from "./fixtures";
import type { FakeScenario } from "./settings";

/**
 * Puts the app's own browser storage in the state a scenario needs: which
 * ruleset is selected, the scenario's local ruleset, and no cached Jira token.
 */
export function setUpScenario(scenario: FakeScenario) {
	const storage = getSafeStorage();
	deleteDraft(storage, fakeLocalRuleset.id);
	if (scenario === "local-ruleset") {
		saveDraft(storage, fakeLocalRuleset);
		writeSelectedId(fakeLocalRuleset.id);
	} else {
		writeSelectedId(fixtureRulesetId);
	}
	jiraAuthenticationContext.invalidate();
}
