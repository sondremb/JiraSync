import { beforeEach, describe, expect, test, vi } from "vitest";
import { bekkClient } from "../../src/data/bekkclient";
import {
	loadAllTimecodes,
	loadTimecodesByIds,
} from "../../src/data/loadTimecodes";

vi.mock("../../src/data/bekkclient", () => ({
	bekkClient: { GET: vi.fn() },
}));
const get = vi.mocked(bekkClient.GET);
const ok = (data: unknown) => ({ response: { ok: true }, data }) as never;

beforeEach(() => get.mockReset());

describe("loadAllTimecodes", () => {
	test("requests only the picker fields and normalises entries", async () => {
		get.mockResolvedValueOnce(
			ok([
				{ id: 1, code: "A-1", name: "One", active: true },
				{ id: 2, code: null, name: null, active: false },
				{ code: "no-id" },
			]),
		);

		await expect(loadAllTimecodes()).resolves.toEqual([
			{ id: 1, code: "A-1", name: "One", active: true },
			{ id: 2, code: "", name: "", active: false },
		]);
		expect(get).toHaveBeenCalledWith("/v3/timecodes", {
			params: { query: { Fields: "id,code,name,active" } },
		});
	});

	test("throws on a failed response", async () => {
		get.mockResolvedValueOnce({ response: { ok: false } } as never);
		await expect(loadAllTimecodes()).rejects.toThrow();
	});
});

describe("loadTimecodesByIds", () => {
	test("deduplicates ids, chunks requests and omits unknown ids", async () => {
		const ids = Array.from({ length: 150 }, (_, i) => i + 1);
		get
			.mockResolvedValueOnce(
				ok([{ id: 1, code: "A", name: "a", active: true }]),
			)
			.mockResolvedValueOnce(
				ok([{ id: 101, code: "B", name: "b", active: false }]),
			);

		const result = await loadTimecodesByIds([...ids, 1, 2]);

		expect(get).toHaveBeenCalledTimes(2);
		expect(get.mock.calls[0][1]).toMatchObject({
			params: { query: { Ids: ids.slice(0, 100) } },
		});
		expect([...result.keys()]).toEqual([1, 101]);
	});

	test("makes no request for an empty list", async () => {
		await expect(loadTimecodesByIds([])).resolves.toEqual(new Map());
		expect(get).not.toHaveBeenCalled();
	});
});
