import { describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import type { InternalTimecodeId } from "../../src/reconciliation/entities";
import { syncWeek } from "../../src/reconciliation/syncWeek";

const date = IsoDate.parse("2025-02-03");
const changes = [
	{
		date,
		timecodeId: 201 as InternalTimecodeId,
		currentHours: 1,
		targetHours: 2,
	},
	{
		date,
		timecodeId: 202 as InternalTimecodeId,
		currentHours: 3,
		targetHours: 0,
	},
	{
		date,
		timecodeId: 203 as InternalTimecodeId,
		currentHours: 0,
		targetHours: 4,
	},
];

describe("syncWeek", () => {
	test("writes every proposed change in order", async () => {
		const write = vi.fn().mockResolvedValue(undefined);
		await syncWeek(changes, write);
		expect(write.mock.calls.map(([change]) => change)).toEqual(changes);
	});

	test("stops at the failed change and reports how many writes succeeded", async () => {
		const failure = new Error("Date locked");
		const write = vi
			.fn()
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(failure);
		await expect(syncWeek(changes, write)).rejects.toThrow(
			`Updated 1 of 3 entries. Failed on ${date} / 202: Date locked`,
		);
		expect(write).toHaveBeenCalledTimes(2);
	});
});
