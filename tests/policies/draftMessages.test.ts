import { describe, expect, test } from "vitest";
import {
	DraftRule,
	DraftRuleset,
	validateDraft,
} from "../../src/policies/draft";
import {
	idErrorText,
	nameErrorText,
	projectKeyErrorText,
	rulesErrorText,
	timecodeErrorText,
} from "../../src/policies/draftMessages";

describe("draft error texts", () => {
	test("every error from validateDraft has a text", () => {
		const result = validateDraft(
			{ ...DraftRuleset.empty(), rules: [DraftRule.empty()] },
			new Set(),
		);
		expect(idErrorText[result.id!]).toBeTruthy();
		expect(nameErrorText[result.name!]).toBeTruthy();
		expect(projectKeyErrorText[result.ruleErrors[0].projectKey!]).toBeTruthy();
		expect(timecodeErrorText[result.ruleErrors[0].timecode!]).toBeTruthy();

		const empty = validateDraft(
			{ ...DraftRuleset.empty(), rules: [] },
			new Set(),
		);
		expect(rulesErrorText[empty.rules!]).toBeTruthy();
	});
});
