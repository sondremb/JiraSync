/**
 * Returnerer en kopi av arrayet med unike elementer.
 */
export function unique<T>(array: T[]): T[] {
	return Array.from(new Set(array));
}

/**
 * Konverterer en array til et objekt (Record) der nøklene er generert av keySelector og verdiene er elementene i arrayet.
 * @param array
 * @param keySelector
 */
export function toRecord<T, K extends string | number | symbol>(
	array: T[],
	keySelector: (item: T) => K,
): Record<K, T>;
/**
 * Konverterer en array til et objekt (Record) der nøklene er generert av keySelector og verdiene er generert av valueSelector.
 * @param array
 * @param keySelector
 * @param valueSelector
 */
export function toRecord<T, K extends string | number | symbol, V>(
	array: T[],
	keySelector: (item: T) => K,
	valueSelector: (item: T) => V,
): Record<K, V>;
export function toRecord<TItem, TKey extends string | number | symbol, TValue>(
	array: TItem[],
	keySelector: (item: TItem) => TKey,
	valueSelector: (item: TItem) => TValue = (item) => item as unknown as TValue,
): Record<TKey, TValue> {
	const record: Record<TKey, TValue> = {} as Record<TKey, TValue>;
	for (const item of array) {
		const key = keySelector(item);
		const value = valueSelector(item);
		record[key] = value;
	}
	return record;
}
