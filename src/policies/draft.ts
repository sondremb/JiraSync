import { type JiraProjectKey } from "../data/issue";
import { type Jql, type Rule, type Ruleset, type RulesetId } from "../rules";
import { type BekkId } from "../types";

/**
 * Editable, possibly incomplete form of a ruleset. Everything here is plain
 * strings/nullable so half-typed input can be held while editing; use
 * `validateDraft` before turning it into a `Ruleset` with `toRuleset`.
 */
export interface DraftRule {
	projectKey: string;
	jql: string;
	timecode: number | null;
	comment: string;
}

export interface DraftRuleset {
	id: string;
	name: string;
	description: string;
	rules: DraftRule[];
}

export const reservedRulesetIds: readonly string[] = ["new"];
const idPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const DraftRule = {
	empty: (): DraftRule => ({
		projectKey: "",
		jql: "",
		timecode: null,
		comment: "",
	}),
	fromRule: (rule: Rule): DraftRule => ({
		projectKey: rule.projectKey,
		jql: rule.jql ?? "",
		timecode: rule.timecode,
		comment: rule.comment ?? "",
	}),
};

export const DraftRuleset = {
	empty: (): DraftRuleset => ({
		id: "",
		name: "",
		description: "",
		rules: [DraftRule.empty()],
	}),
	fromRuleset: (ruleset: Ruleset): DraftRuleset => ({
		id: ruleset.id,
		name: ruleset.name,
		description: ruleset.description ?? "",
		rules: ruleset.rules.map(DraftRule.fromRule),
	}),
};

export function updateMeta(
	draft: DraftRuleset,
	patch: Partial<Pick<DraftRuleset, "id" | "name" | "description">>,
): DraftRuleset {
	return { ...draft, ...patch };
}

export function updateRule(
	draft: DraftRuleset,
	index: number,
	patch: Partial<DraftRule>,
): DraftRuleset {
	assertIndex(draft, index);
	return {
		...draft,
		rules: draft.rules.map((rule, i) =>
			i === index ? { ...rule, ...patch } : rule,
		),
	};
}

export function deleteRule(draft: DraftRuleset, index: number): DraftRuleset {
	assertIndex(draft, index);
	return { ...draft, rules: draft.rules.filter((_, i) => i !== index) };
}

/** Inserts so the new rule ends up at `index` (0 = first, rules.length = last). */
export function insertRule(
	draft: DraftRuleset,
	index: number,
	rule: DraftRule = DraftRule.empty(),
): DraftRuleset {
	if (index < 0 || index > draft.rules.length) {
		throw new RangeError(`Cannot insert rule at index ${index}`);
	}
	const rules = [...draft.rules];
	rules.splice(index, 0, rule);
	return { ...draft, rules };
}

/** Moves the rule at `from` so that it ends up at index `to`. */
export function moveRule(
	draft: DraftRuleset,
	from: number,
	to: number,
): DraftRuleset {
	assertIndex(draft, from);
	assertIndex(draft, to);
	if (from === to) {
		return draft;
	}
	const rules = [...draft.rules];
	const [moved] = rules.splice(from, 1);
	rules.splice(to, 0, moved);
	return { ...draft, rules };
}

function assertIndex(draft: DraftRuleset, index: number) {
	if (!Number.isInteger(index) || index < 0 || index >= draft.rules.length) {
		throw new RangeError(`No rule at index ${index}`);
	}
}

export type IdError = "required" | "invalid-format" | "reserved" | "taken";

export interface RuleErrors {
	projectKey?: "required";
	timecode?: "required" | "invalid";
}

export interface DraftValidation {
	valid: boolean;
	id?: IdError;
	name?: "required";
	rules?: "empty";
	/** Sparse, keyed by rule index. */
	ruleErrors: Record<number, RuleErrors>;
}

export function validateDraft(
	draft: DraftRuleset,
	/** Ids that are already in use by other rulesets (bundled and drafts). */
	takenIds: ReadonlySet<string>,
): DraftValidation {
	const result: DraftValidation = { valid: true, ruleErrors: {} };

	const id = draft.id.trim();
	if (id === "") {
		result.id = "required";
	} else if (!idPattern.test(id)) {
		result.id = "invalid-format";
	} else if (reservedRulesetIds.includes(id)) {
		result.id = "reserved";
	} else if (takenIds.has(id)) {
		result.id = "taken";
	}

	if (draft.name.trim() === "") {
		result.name = "required";
	}

	if (draft.rules.length === 0) {
		result.rules = "empty";
	}

	draft.rules.forEach((rule, index) => {
		const errors: RuleErrors = {};
		if (rule.projectKey.trim() === "") {
			errors.projectKey = "required";
		}
		if (rule.timecode === null) {
			errors.timecode = "required";
		} else if (!Number.isInteger(rule.timecode) || rule.timecode <= 0) {
			errors.timecode = "invalid";
		}
		if (Object.keys(errors).length > 0) {
			result.ruleErrors[index] = errors;
		}
	});

	result.valid =
		!result.id &&
		!result.name &&
		!result.rules &&
		Object.keys(result.ruleErrors).length === 0;
	return result;
}

/**
 * Converts a valid draft to a `Ruleset`: values are trimmed, and empty
 * optional fields are omitted. Call `validateDraft` first.
 */
export function toRuleset(draft: DraftRuleset): Ruleset {
	const description = draft.description.trim();
	const ruleset: Ruleset = {
		id: draft.id.trim() as RulesetId,
		name: draft.name.trim(),
		rules: draft.rules.map(toRule),
	};
	if (description) {
		// Keep key order identical to policies.json: id, name, description, rules.
		return {
			id: ruleset.id,
			name: ruleset.name,
			description,
			rules: ruleset.rules,
		};
	}
	return ruleset;
}

function toRule(rule: DraftRule): Rule {
	if (rule.timecode === null) {
		throw new Error("Cannot convert a rule without a timecode");
	}
	const jql = rule.jql.trim();
	const comment = rule.comment.trim();
	// Key order identical to policies.json: projectKey, jql, timecode, comment.
	return {
		projectKey: rule.projectKey.trim() as JiraProjectKey,
		...(jql ? { jql: jql as Jql } : {}),
		timecode: rule.timecode as BekkId,
		...(comment ? { comment } : {}),
	};
}

/** The text offered for download/copy: one ruleset, ready to paste into `rulesets` in policies.json. */
export function exportRuleset(ruleset: Ruleset): string {
	return JSON.stringify(ruleset, null, "\t");
}
