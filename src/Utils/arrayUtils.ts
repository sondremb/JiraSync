/**
 * Returnerer en kopi av arrayet med unike elementer.
 */
export function unique<T>(array: readonly T[]): T[] {
	return Array.from(new Set(array));
}

/**
 * Konverterer en array til et objekt (Map) der nøklene er generert av keySelector og verdiene er elementene i arrayet.
 * @param array
 * @param keySelector
 */
export function toMap<T, K extends string | number | symbol>(
	array: readonly T[],
	keySelector: (item: T) => K,
): Map<K, T>;
/**
 * Konverterer en array til et objekt (Map) der nøklene er generert av keySelector og verdiene er generert av valueSelector.
 * @param array
 * @param keySelector
 * @param valueSelector
 */
export function toMap<T, K extends string | number | symbol, V>(
	array: readonly T[],
	keySelector: (item: T) => K,
	valueSelector: (item: T) => V,
): Map<K, V>;
export function toMap<TItem, TKey extends string | number | symbol, TValue>(
	array: readonly TItem[],
	keySelector: (item: TItem) => TKey,
	valueSelector: (item: TItem) => TValue = (item) => item as unknown as TValue,
): Map<TKey, TValue> {
	const map: Map<TKey, TValue> = new Map();
	for (const item of array) {
		const key = keySelector(item);
		const value = valueSelector(item);
		map.set(key, value);
	}
	return map;
}

export function groupBy<T, K extends string | number | symbol>(
	array: readonly T[],
	keySelector: (item: T) => K,
): Map<K, T[]>;
export function groupBy<T, K extends string | number | symbol, V>(
	array: readonly T[],
	keySelector: (item: T) => K,
	valueSelector: (item: T) => V,
): Map<K, V[]>;
export function groupBy<TItem, TKey extends string | number | symbol, TValue>(
	array: readonly TItem[],
	keySelector: (item: TItem) => TKey,
	valueSelector: (item: TItem) => TValue = (item) => item as unknown as TValue,
): Map<TKey, TValue[]> {
	const itemsByKey: Map<TKey, TValue[]> = new Map();
	for (const item of array) {
		const key = keySelector(item);
		let itemsForKey = itemsByKey.get(key);
		if (itemsForKey === undefined) {
			itemsForKey = [];
			itemsByKey.set(key, itemsForKey);
		}
		const value = valueSelector(item);
		itemsForKey.push(value);
	}
	return itemsByKey;
}
