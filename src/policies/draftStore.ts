import { type Ruleset } from "../rules";
import { loadPolicies, rulesetSchema } from "./schema";

export const draftsStorageKey = "jirasync.drafts";

/** The subset of `Storage` the store needs, so tests can pass a fake. */
export type DraftStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Reads saved drafts. Never throws: unavailable storage, bad JSON and
 * individual entries that no longer match the schema are skipped.
 */
export function loadDrafts(storage: DraftStorage): Ruleset[] {
	let raw: unknown;
	try {
		const text = storage.getItem(draftsStorageKey);
		if (text === null) {
			return [];
		}
		raw = JSON.parse(text);
	} catch {
		return [];
	}
	if (!Array.isArray(raw)) {
		return [];
	}
	const valid = raw.filter((entry) => rulesetSchema.safeParse(entry).success);
	return valid.length === 0 ? [] : loadRulesets(valid);
}

/** Inserts the draft, or replaces the saved draft with the same id. */
export function saveDraft(storage: DraftStorage, draft: Ruleset): Ruleset[] {
	const others = loadDrafts(storage).filter((d) => d.id !== draft.id);
	const next = [...others, draft];
	write(storage, next);
	return next;
}

export function deleteDraft(storage: DraftStorage, id: string): Ruleset[] {
	const next = loadDrafts(storage).filter((d) => d.id !== id);
	write(storage, next);
	return next;
}

function write(storage: DraftStorage, drafts: Ruleset[]) {
	storage.setItem(draftsStorageKey, JSON.stringify(drafts));
}

function loadRulesets(valid: unknown[]): Ruleset[] {
	return loadPolicies({ schemaVersion: 1, rulesets: valid });
}

/** `localStorage`, or a no-op store where access is blocked (private windows, cleared site data). */
export function getDraftStorage(): DraftStorage {
	try {
		return window.localStorage;
	} catch {
		return { getItem: () => null, setItem: () => {} };
	}
}
