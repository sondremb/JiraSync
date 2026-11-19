/** The subset of `Storage` the app needs, so tests can pass a fake. */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

/** `localStorage`, or a no-op store where access is blocked (private windows, cleared site data). */
export function getSafeStorage(): KeyValueStorage {
	try {
		return window.localStorage;
	} catch {
		return { getItem: () => null, setItem: () => {} };
	}
}
