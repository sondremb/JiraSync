import { type Ruleset } from "../rules";

/**
 * - `bundled`: shipped in policies.json
 * - `draft`: only exists as a local draft
 * - `edited`: a local draft that has the same id as a bundled ruleset and overrides it locally
 */
export type CatalogKind = "bundled" | "draft" | "edited";

export interface CatalogEntry {
	ruleset: Ruleset;
	kind: CatalogKind;
	isSelected: boolean;
}

/** Bundled rulesets and local drafts as one list, with the user's selected ruleset first. */
export function buildCatalog(
	bundled: readonly Ruleset[],
	drafts: readonly Ruleset[],
	selectedId: string | undefined,
): CatalogEntry[] {
	const draftsById = new Map(drafts.map((d) => [d.id as string, d]));
	const bundledIds = new Set(bundled.map((r) => r.id as string));

	const entries: CatalogEntry[] = [
		...bundled.map((ruleset): CatalogEntry => {
			const override = draftsById.get(ruleset.id);
			return override
				? { ruleset: override, kind: "edited", isSelected: false }
				: { ruleset, kind: "bundled", isSelected: false };
		}),
		...drafts
			.filter((d) => !bundledIds.has(d.id))
			.map((ruleset): CatalogEntry => ({
				ruleset,
				kind: "draft",
				isSelected: false,
			})),
	].map((entry) => ({ ...entry, isSelected: entry.ruleset.id === selectedId }));

	// Array.prototype.sort is stable, so the rest keep their order.
	return entries.sort((a, b) => Number(b.isSelected) - Number(a.isSelected));
}

export function findEntry(
	catalog: readonly CatalogEntry[],
	id: string,
): CatalogEntry | undefined {
	return catalog.find((entry) => entry.ruleset.id === id);
}

/**
 * The ruleset with `selectedId`, with local drafts overriding bundled rulesets
 * the same way as in `buildCatalog`. `undefined` when nothing is selected or the
 * selected ruleset no longer exists (for example a deleted draft).
 */
export function resolveSelected(
	bundled: readonly Ruleset[],
	drafts: readonly Ruleset[],
	selectedId: string | null | undefined,
): Ruleset | undefined {
	if (!selectedId) {
		return undefined;
	}
	return (
		drafts.find((d) => d.id === selectedId) ??
		bundled.find((r) => r.id === selectedId)
	);
}

/**
 * A short key that changes whenever the ruleset's id or rules change, so views
 * keyed on it remount when a selected draft is edited.
 */
export function rulesetKey(ruleset: Ruleset): string {
	const text = JSON.stringify([ruleset.id, ruleset.rules]);
	// FNV-1a, 32 bit. Not cryptographic: only needs to differ between edits.
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return `${ruleset.id}-${(hash >>> 0).toString(36)}`;
}
