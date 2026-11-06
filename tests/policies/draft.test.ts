import { describe, expect, test } from "vitest";
import {
	DraftRule,
	DraftRuleset,
	deleteRule,
	exportRuleset,
	insertRule,
	moveRule,
	toRuleset,
	updateMeta,
	updateRule,
	validateDraft,
} from "../../src/policies/draft";
import { loadPolicies } from "../../src/policies/schema";

function draft(overrides: Partial<DraftRuleset> = {}): DraftRuleset {
	return {
		id: "my-rules",
		name: "My rules",
		description: "",
		rules: [
			{ projectKey: "AAA", jql: "", timecode: 1, comment: "" },
			{ projectKey: "BBB", jql: "", timecode: 2, comment: "" },
			{ projectKey: "CCC", jql: "", timecode: 3, comment: "" },
		],
		...overrides,
	};
}

const keys = (d: DraftRuleset) => d.rules.map((r) => r.projectKey);
const noTakenIds = new Set<string>();

describe("editing", () => {
	test("insertRule places the rule at any position", () => {
		const blank = { ...DraftRule.empty(), projectKey: "NEW" };
		expect(keys(insertRule(draft(), 0, blank))).toEqual([
			"NEW",
			"AAA",
			"BBB",
			"CCC",
		]);
		expect(keys(insertRule(draft(), 2, blank))).toEqual([
			"AAA",
			"BBB",
			"NEW",
			"CCC",
		]);
		expect(keys(insertRule(draft(), 3, blank))).toEqual([
			"AAA",
			"BBB",
			"CCC",
			"NEW",
		]);
		expect(() => insertRule(draft(), 4)).toThrow(RangeError);
	});

	test("moveRule moves a rule to the target index", () => {
		expect(keys(moveRule(draft(), 0, 2))).toEqual(["BBB", "CCC", "AAA"]);
		expect(keys(moveRule(draft(), 2, 0))).toEqual(["CCC", "AAA", "BBB"]);
		expect(moveRule(draft(), 1, 1)).toEqual(draft());
		expect(() => moveRule(draft(), 0, 3)).toThrow(RangeError);
	});

	test("deleteRule removes only the given rule", () => {
		expect(keys(deleteRule(draft(), 1))).toEqual(["AAA", "CCC"]);
		expect(() => deleteRule(draft(), 5)).toThrow(RangeError);
	});

	test("updateRule and updateMeta do not mutate the input", () => {
		const original = draft();
		const updated = updateRule(original, 1, { jql: "component = 1" });
		expect(updated.rules[1].jql).toBe("component = 1");
		expect(original.rules[1].jql).toBe("");
		expect(updateMeta(original, { name: "X" }).name).toBe("X");
		expect(original.name).toBe("My rules");
	});
});

describe("validateDraft", () => {
	test("accepts a complete draft", () => {
		const result = validateDraft(draft(), noTakenIds);
		expect(result).toEqual({ valid: true, ruleErrors: {} });
	});

	test.each([
		["", "required"],
		["My Rules", "invalid-format"],
		["-leading", "invalid-format"],
		["double--dash", "invalid-format"],
		["new", "reserved"],
		["all", "reserved"],
		["taken-id", "taken"],
	])("id %j gives %s", (id, expected) => {
		const result = validateDraft(draft({ id }), new Set(["taken-id"]));
		expect(result.id).toBe(expected);
		expect(result.valid).toBe(false);
	});

	test("requires a name and at least one rule", () => {
		const result = validateDraft(draft({ name: "  ", rules: [] }), noTakenIds);
		expect(result.name).toBe("required");
		expect(result.rules).toBe("empty");
		expect(result.valid).toBe(false);
	});

	test("reports rule errors by index", () => {
		const bad = draft({
			rules: [
				{ projectKey: "AAA", jql: "", timecode: 1, comment: "" },
				{ projectKey: " ", jql: "", timecode: null, comment: "" },
				{ projectKey: "CCC", jql: "", timecode: -4, comment: "" },
			],
		});
		const result = validateDraft(bad, noTakenIds);
		expect(result.ruleErrors).toEqual({
			1: { projectKey: "required", timecode: "required" },
			2: { timecode: "invalid" },
		});
		expect(result.valid).toBe(false);
	});

	test("a new empty draft is invalid", () => {
		expect(validateDraft(DraftRuleset.empty(), noTakenIds).valid).toBe(false);
	});
});

describe("toRuleset / exportRuleset", () => {
	test("trims and omits empty optional fields", () => {
		const ruleset = toRuleset(
			draft({
				id: " my-rules ",
				description: "  ",
				rules: [
					{ projectKey: " AAA ", jql: "  ", timecode: 1, comment: "" },
					{
						projectKey: "BBB",
						jql: " component = 7 ",
						timecode: 2,
						comment: " Dev ",
					},
				],
			}),
		);
		expect(ruleset).toEqual({
			id: "my-rules",
			name: "My rules",
			rules: [
				{ projectKey: "AAA", timecode: 1 },
				{
					projectKey: "BBB",
					jql: "component = 7",
					timecode: 2,
					comment: "Dev",
				},
			],
		});
		expect("description" in ruleset).toBe(false);
	});

	test("throws if a rule has no timecode", () => {
		const incomplete = draft({
			rules: [{ projectKey: "AAA", jql: "", timecode: null, comment: "" }],
		});
		expect(() => toRuleset(incomplete)).toThrow();
	});

	test("export matches policies.json layout and round-trips through loadPolicies", () => {
		const original = toRuleset(
			draft({
				description: "Desc",
				rules: [
					{
						projectKey: "AAA",
						jql: "component = 1",
						timecode: 1,
						comment: "Dev",
					},
					{ projectKey: "BBB", jql: "", timecode: 2, comment: "" },
				],
			}),
		);
		const json = exportRuleset(original);
		expect(Object.keys(JSON.parse(json))).toEqual([
			"id",
			"name",
			"description",
			"rules",
		]);
		expect(Object.keys(JSON.parse(json).rules[0])).toEqual([
			"projectKey",
			"jql",
			"timecode",
			"comment",
		]);
		const reloaded = loadPolicies({
			schemaVersion: 1,
			rulesets: [JSON.parse(json)],
		});
		expect(reloaded).toEqual([original]);
	});

	test("fromRuleset then toRuleset is lossless", () => {
		const [bundled] = loadPolicies({
			schemaVersion: 1,
			rulesets: [
				{
					id: "x",
					name: "X",
					description: "D",
					rules: [
						{
							projectKey: "AAA",
							jql: "component = 1",
							timecode: 5,
							comment: "c",
						},
					],
				},
			],
		});
		expect(toRuleset(DraftRuleset.fromRuleset(bundled))).toEqual(bundled);
	});
});
