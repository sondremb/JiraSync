import { describe, expect, test } from "vitest";
import {
	deleteDraft,
	draftsStorageKey,
	loadDrafts,
	saveDraft,
	type DraftStorage,
} from "../../src/policies/draftStore";
import { type Ruleset, type RulesetId } from "../../src/rules";
import { type JiraProjectKey } from "../../src/data/issue";
import { type BekkId } from "../../src/types";

function fakeStorage(
	initial?: string,
): DraftStorage & { value: string | null } {
	const storage = {
		value: initial ?? null,
		getItem: () => storage.value,
		setItem: (_key: string, value: string) => {
			storage.value = value;
		},
	};
	return storage;
}

function ruleset(id: string, name = id): Ruleset {
	return {
		id: id as RulesetId,
		name,
		rules: [{ projectKey: "AAA" as JiraProjectKey, timecode: 1 as BekkId }],
	};
}

describe("draft store", () => {
	test("is empty when nothing is saved", () => {
		expect(loadDrafts(fakeStorage())).toEqual([]);
	});

	test("saves, replaces by id, and deletes", () => {
		const storage = fakeStorage();
		saveDraft(storage, ruleset("a"));
		saveDraft(storage, ruleset("b"));
		expect(loadDrafts(storage).map((d) => d.id)).toEqual(["a", "b"]);

		saveDraft(storage, ruleset("a", "Renamed"));
		expect(loadDrafts(storage).find((d) => d.id === "a")?.name).toBe("Renamed");
		expect(loadDrafts(storage)).toHaveLength(2);

		deleteDraft(storage, "a");
		expect(loadDrafts(storage).map((d) => d.id)).toEqual(["b"]);
	});

	test("tolerates corrupt JSON and non-array content", () => {
		expect(loadDrafts(fakeStorage("{not json"))).toEqual([]);
		expect(loadDrafts(fakeStorage('{"a":1}'))).toEqual([]);
	});

	test("skips invalid entries but keeps valid ones", () => {
		const stored = JSON.stringify([
			{ id: "ok", name: "Ok", rules: [{ projectKey: "AAA", timecode: 1 }] },
			{ id: "", name: "Bad", rules: [] },
		]);
		expect(loadDrafts(fakeStorage(stored)).map((d) => d.id)).toEqual(["ok"]);
	});

	test("tolerates storage that throws", () => {
		const throwing: DraftStorage = {
			getItem: () => {
				throw new Error("blocked");
			},
			setItem: () => {},
		};
		expect(loadDrafts(throwing)).toEqual([]);
	});

	test("uses a stable storage key", () => {
		const storage = fakeStorage();
		saveDraft(storage, ruleset("a"));
		expect(draftsStorageKey).toBe("jirasync.drafts");
		expect(JSON.parse(storage.value!)).toHaveLength(1);
	});
});
