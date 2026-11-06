import { describe, expect, test } from "vitest";
import {
	buildCatalog,
	findEntry,
	resolveSelected,
	rulesetKey,
} from "../../src/policies/catalog";
import {
	type Jql,
	type Rule,
	type Ruleset,
	type RulesetId,
} from "../../src/rules";

function ruleset(id: string, name = id): Ruleset {
	return { id: id as RulesetId, name, rules: [] };
}

describe("buildCatalog", () => {
	const bundled = [ruleset("a"), ruleset("b"), ruleset("c")];

	test("keeps bundled order and marks nothing selected without a selection", () => {
		const catalog = buildCatalog(bundled, [], undefined);
		expect(catalog.map((e) => e.ruleset.id)).toEqual(["a", "b", "c"]);
		expect(catalog.every((e) => !e.isSelected && e.kind === "bundled")).toBe(
			true,
		);
	});

	test("puts the selected ruleset first and keeps the rest in order", () => {
		const catalog = buildCatalog(bundled, [], "c");
		expect(catalog.map((e) => e.ruleset.id)).toEqual(["c", "a", "b"]);
		expect(catalog[0].isSelected).toBe(true);
	});

	test("appends draft-only rulesets after the bundled ones", () => {
		const catalog = buildCatalog(bundled, [ruleset("mine")], undefined);
		expect(catalog.map((e) => [e.ruleset.id, e.kind])).toEqual([
			["a", "bundled"],
			["b", "bundled"],
			["c", "bundled"],
			["mine", "draft"],
		]);
	});

	test("a draft with a bundled id overrides it in place", () => {
		const catalog = buildCatalog(bundled, [ruleset("b", "My b")], undefined);
		expect(catalog.map((e) => e.ruleset.id)).toEqual(["a", "b", "c"]);
		expect(catalog[1]).toMatchObject({ kind: "edited" });
		expect(catalog[1].ruleset.name).toBe("My b");
	});

	test("selection can point at a draft", () => {
		const catalog = buildCatalog(bundled, [ruleset("mine")], "mine");
		expect(catalog[0]).toMatchObject({ kind: "draft", isSelected: true });
	});

	test("findEntry looks up by id", () => {
		const catalog = buildCatalog(bundled, [], undefined);
		expect(findEntry(catalog, "b")?.ruleset.id).toBe("b");
		expect(findEntry(catalog, "zzz")).toBeUndefined();
	});
});

describe("resolveSelected", () => {
	const bundled = [ruleset("a", "A"), ruleset("b", "B")];

	test("nothing selected gives undefined", () => {
		expect(resolveSelected(bundled, [], null)).toBeUndefined();
		expect(resolveSelected(bundled, [], undefined)).toBeUndefined();
	});

	test("finds a bundled ruleset", () => {
		expect(resolveSelected(bundled, [], "b")?.name).toBe("B");
	});

	test("finds a draft-only ruleset", () => {
		expect(resolveSelected(bundled, [ruleset("mine")], "mine")?.id).toBe(
			"mine",
		);
	});

	test("an edited copy overrides the bundled ruleset", () => {
		expect(resolveSelected(bundled, [ruleset("b", "My b")], "b")?.name).toBe(
			"My b",
		);
	});

	test("deleting an edited copy falls back to the bundled ruleset", () => {
		expect(resolveSelected(bundled, [], "b")?.name).toBe("B");
	});

	test("a selected draft that was deleted gives undefined", () => {
		expect(resolveSelected(bundled, [], "mine")).toBeUndefined();
	});
});

describe("rulesetKey", () => {
	const base: Ruleset = {
		id: "x" as RulesetId,
		name: "X",
		rules: [{ projectKey: "P", timecode: 1 } as unknown as Rule],
	};

	test("is stable for equal rulesets", () => {
		expect(rulesetKey(base)).toBe(rulesetKey(structuredClone(base)));
	});

	test("changes when the rules change", () => {
		const edited = structuredClone(base);
		edited.rules[0] = { ...edited.rules[0], jql: "component = 1" as Jql };
		expect(rulesetKey(edited)).not.toBe(rulesetKey(base));
	});

	test("ignores name and description", () => {
		expect(rulesetKey({ ...base, name: "Y", description: "d" })).toBe(
			rulesetKey(base),
		);
	});
});
