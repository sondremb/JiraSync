import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import { bekkClient } from "../../src/data/bekkclient";
import { lockBekkHours } from "../../src/data/lockBekkHours";

vi.mock("../../src/data/bekkclient", () => ({
	bekkClient: { PUT: vi.fn() },
}));
vi.mock("../../src/login/bekk/bekkLogin", () => ({ getEmployeeId: () => 42 }));
const put = vi.mocked(bekkClient.PUT);
const lockDate = IsoDate.parse("2026-11-30");
const locked = {
	response: { ok: true },
	data: { timesheetSuccessfullyLocked: true },
} as never;

beforeEach(() => put.mockReset());

describe("lockBekkHours", () => {
	test("locks without a body when no overtime is signed", async () => {
		put.mockResolvedValue(locked);
		await lockBekkHours(IsoDate.parse("2026-11-29"));
		expect(put).toHaveBeenCalledExactlyOnceWith("/timesheets/lockhours", {
			params: { query: { employeeId: 42, lockDate: "2026-11-29" } },
			body: undefined,
		});
	});

	test("sends the signed overtime as the body", async () => {
		put.mockResolvedValue(locked);
		const signed = { year: 2026, month: 11, payoutHours: 6, flexHours: 3.5 };
		await lockBekkHours(lockDate, signed);
		expect(put).toHaveBeenCalledExactlyOnceWith("/timesheets/lockhours", {
			params: { query: { employeeId: 42, lockDate } },
			body: signed,
		});
	});

	test("rejects with Bekk's message from an error response", async () => {
		put.mockResolvedValue({
			response: { ok: false, status: 400 },
			error: {
				userMessage: "Signering av overtid må angis når måneden låses.",
			},
		} as never);
		await expect(lockBekkHours(lockDate)).rejects.toThrow(
			"Signering av overtid må angis når måneden låses.",
		);
	});

	test("rejects a response that didn't lock", async () => {
		put.mockResolvedValue({
			response: { ok: true, status: 200 },
			data: { timesheetSuccessfullyLocked: false },
		} as never);
		await expect(lockBekkHours(lockDate)).rejects.toThrow(
			"Kunne ikke låse timer til 2026-11-30 (200)",
		);
	});
});
