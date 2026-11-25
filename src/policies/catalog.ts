import { type Ruleset } from "../rules";

/**
 * - `bundled`: shipped in policies.json
 * - `local`: saved in this browser
 */
export type CatalogKind = "bundled" | "local";

export interface CatalogEntry {
	ruleset: Ruleset;
	kind: CatalogKind;
	/** A local ruleset with the same id as a bundled one, which it overrides. Always `false` for bundled rulesets. */
	overridesBundled: boolean;
	isSelected: boolean;
}

/** Bundled and local rulesets as one list, with the user's selected ruleset first. */
export function buildCatalog(
	bundled: readonly Ruleset[],
	localRulesets: readonly Ruleset[],
	selectedId: string | undefined,
): CatalogEntry[] {
	const localById = new Map(localRulesets.map((l) => [l.id as string, l]));
	const bundledIds = new Set(bundled.map((r) => r.id as string));

	const entries: CatalogEntry[] = [
		...bundled.map((ruleset): CatalogEntry => {
			const override = localById.get(ruleset.id);
			return override
				? {
						ruleset: override,
						kind: "local",
						overridesBundled: true,
						isSelected: false,
					}
				: {
						ruleset,
						kind: "bundled",
						overridesBundled: false,
						isSelected: false,
					};
		}),
		...localRulesets
			.filter((l) => !bundledIds.has(l.id))
			.map((ruleset): CatalogEntry => ({
				ruleset,
				kind: "local",
				overridesBundled: false,
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
 * The ruleset with `selectedId`, with local rulesets overriding bundled rulesets
 * the same way as in `buildCatalog`. `undefined` when nothing is selected or the
 * selected ruleset no longer exists (for example a deleted local ruleset).
 */
export function resolveSelected(
	bundled: readonly Ruleset[],
	localRulesets: readonly Ruleset[],
	selectedId: string | null | undefined,
): Ruleset | undefined {
	if (!selectedId) {
		return undefined;
	}
	return (
		localRulesets.find((l) => l.id === selectedId) ??
		bundled.find((r) => r.id === selectedId)
	);
}

/**
 * A short key that changes whenever the ruleset's id or rules change, so views
 * keyed on it remount when a selected local ruleset is edited.
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
