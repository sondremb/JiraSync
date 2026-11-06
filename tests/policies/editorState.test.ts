import { describe, expect, test } from "vitest";
import { type JiraProjectKey } from "../../src/data/issue";
import { buildCatalog } from "../../src/policies/catalog";
import { DraftRuleset } from "../../src/policies/draft";
import {
	effectiveJql,
	exportFileName,
	firstInvalidRule,
	initialDraft,
	takenIds,
} from "../../src/policies/editorState";
import { type Ruleset, type RulesetId } from "../../src/rules";
import { type BekkId } from "../../src/types";

function ruleset(id: string, name = id): Ruleset {
	return {
		id: id as RulesetId,
		name,
		description: "Beskrivelse",
		rules: [{ projectKey: "ABC" as JiraProjectKey, timecode: 12 as BekkId }],
	};
}

describe("initialDraft", () => {
	const [entry] = buildCatalog([ruleset("team", "Team")], [], undefined);

	test("edit starts from the ruleset itself", () => {
		expect(initialDraft("edit", entry)).toEqual(
			DraftRuleset.fromRuleset(entry.ruleset),
		);
	});

	test("new from a source copies it without the id", () => {
		const draft = initialDraft("new", entry);
		expect(draft.id).toBe("");
		expect(draft.name).toBe("Team (kopi)");
		expect(draft.description).toBe("Beskrivelse");
		expect(draft.rules).toEqual(DraftRuleset.fromRuleset(entry.ruleset).rules);
	});

	test("new without a source is empty", () => {
		expect(initialDraft("new", undefined)).toEqual(DraftRuleset.empty());
	});
});

describe("takenIds", () => {
	const catalog = buildCatalog(
		[ruleset("a"), ruleset("b")],
		[ruleset("mine")],
		undefined,
	);

	test("new: every bundled and draft id is taken", () => {
		expect(takenIds(catalog, "new", "a")).toEqual(new Set(["a", "b", "mine"]));
	});

	test("edit: the ruleset's own id is free", () => {
		expect(takenIds(catalog, "edit", "a")).toEqual(new Set(["b", "mine"]));
	});
});

describe("exportFileName", () => {
	test("uses the trimmed id", () => {
		expect(exportFileName(" team ")).toBe("team.json");
	});
});

describe("effectiveJql", () => {
	test("undefined while the project is empty", () => {
		expect(effectiveJql(" ", "component = 1")).toBeUndefined();
	});

	test("project only when the JQL is empty", () => {
		expect(effectiveJql(" ABC ", "  ")).toBe("project = 'ABC'");
	});

	test("combines project and JQL", () => {
		expect(effectiveJql("ABC", " component = 1 ")).toBe(
			"project = 'ABC' AND (component = 1)",
		);
	});
});

describe("firstInvalidRule", () => {
	test("undefined when no rule has errors", () => {
		expect(firstInvalidRule({ valid: true, ruleErrors: {} })).toBeUndefined();
	});

	test("the lowest index with errors", () => {
		expect(
			firstInvalidRule({
				valid: false,
				ruleErrors: {
					4: { timecode: "required" },
					2: { projectKey: "required" },
				},
			}),
		).toBe(2);
	});
});
