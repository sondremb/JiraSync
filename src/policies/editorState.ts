import { type JiraProjectKey } from "../data/issue";
import { Rule, type Jql } from "../rules";
import { type BekkId } from "../types";
import { type CatalogEntry } from "./catalog";
import { type DraftValidation, DraftRuleset } from "./draft";

export type EditorMode = "edit" | "new";

/** What the editor starts with: the ruleset itself, a copy of it, or an empty draft. */
export function initialDraft(
	mode: EditorMode,
	source: CatalogEntry | undefined,
): DraftRuleset {
	if (!source) {
		return DraftRuleset.empty();
	}
	const draft = DraftRuleset.fromRuleset(source.ruleset);
	return mode === "edit"
		? draft
		: { ...draft, id: "", name: `${draft.name} (kopi)` };
}

/**
 * Ids the draft may not use. When editing, the ruleset's own id is free, so
 * saving a bundled ruleset creates an edited copy that overrides it.
 */
export function takenIds(
	catalog: readonly CatalogEntry[],
	mode: EditorMode,
	sourceId: string | undefined,
): Set<string> {
	const ids = new Set<string>(catalog.map((entry) => entry.ruleset.id));
	if (mode === "edit" && sourceId !== undefined) {
		ids.delete(sourceId);
	}
	return ids;
}

export function exportFileName(id: string): string {
	return `${id.trim()}.json`;
}

/** Adds `component = <id>` to a rule's JQL, keeping an existing OR together. */
export function addComponentClause(jql: string, componentId: string): string {
	const clause = `component = ${componentId}`;
	const current = jql.trim();
	if (current === "") {
		return clause;
	}
	const left = /\bor\b/i.test(current) ? `(${current})` : current;
	return `${left} AND ${clause}`;
}

/** The JQL a draft rule will actually run, or undefined while the project is empty. */
export function effectiveJql(projectKey: string, jql: string): Jql | undefined {
	const key = projectKey.trim();
	if (key === "") {
		return undefined;
	}
	return Rule.toFullJql({
		projectKey: key as JiraProjectKey,
		jql: (jql.trim() || undefined) as Jql | undefined,
		timecode: 0 as BekkId, // irrelevant for the JQL string
	});
}

/** Index of the first rule with errors, to open it when saving fails. */
export function firstInvalidRule(
	validation: DraftValidation,
): number | undefined {
	const indices = Object.keys(validation.ruleErrors).map(Number);
	return indices.length > 0 ? Math.min(...indices) : undefined;
}
