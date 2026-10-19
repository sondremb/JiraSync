import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import type { InternalTimecodeId } from "../../src/reconciliation/entities";
import { bekkClient } from "../../src/data/bekkclient";
import { writeInternalHours } from "../../src/data/writeInternalHours";

vi.mock("../../src/data/bekkclient", () => ({
	bekkClient: { PUT: vi.fn(), DELETE: vi.fn() },
}));
vi.mock("../../src/login/bekk/bekkLogin", () => ({ getEmployeeId: () => 42 }));
const put = vi.mocked(bekkClient.PUT);
const remove = vi.mocked(bekkClient.DELETE);
const date = IsoDate.parse("2025-02-03");
const change = {
	date,
	timecodeId: 201 as InternalTimecodeId,
	currentHours: 2,
	targetHours: 3,
};

beforeEach(() => {
	put.mockReset();
	remove.mockReset();
});

describe("writeInternalHours", () => {
	test("puts Jira target hours on a mismatched timecode", async () => {
		put.mockResolvedValue({
			response: { ok: true },
			data: { validationInfo: [] },
		} as never);
		await writeInternalHours(change);
		expect(put).toHaveBeenCalledExactlyOnceWith(
			"/timesheets/employee/{employeeId}",
			{
				params: { path: { employeeId: 42 } },
				body: { timecodeId: 201, date, hours: 3, comment: "" },
			},
		);
		expect(remove).not.toHaveBeenCalled();
	});

	test("deletes hours when Jira target is zero", async () => {
		remove.mockResolvedValue({ response: { ok: true } } as never);
		await writeInternalHours({ ...change, targetHours: 0 });
		expect(remove).toHaveBeenCalledExactlyOnceWith(
			"/timesheets/employee/{employeeId}",
			{
				params: { path: { employeeId: 42 } },
				body: { timecodeId: 201, date },
			},
		);
		expect(put).not.toHaveBeenCalled();
	});

	test("rejects failed HTTP responses and validation messages", async () => {
		put
			.mockResolvedValueOnce({ response: { ok: false, status: 403 } } as never)
			.mockResolvedValueOnce({
				response: { ok: true },
				data: { validationInfo: ["Comment required"] },
			} as never);
		await expect(writeInternalHours(change)).rejects.toThrow(
			"Internal System rejected",
		);
		await expect(writeInternalHours(change)).rejects.toThrow(
			"Comment required",
		);
	});

	test("rejects a successful HTTP response without the update result", async () => {
		put.mockResolvedValue({ response: { ok: true }, data: undefined } as never);
		await expect(writeInternalHours(change)).rejects.toThrow(
			"Internal System rejected the update",
		);
	});
});
