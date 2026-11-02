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
