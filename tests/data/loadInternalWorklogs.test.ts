import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import { bekkClient } from "../../src/data/bekkclient";
import { loadInternalWorklogs } from "../../src/data/loadInternalWorklogs";

vi.mock("../../src/data/bekkclient", () => ({ bekkClient: { GET: vi.fn() } }));
vi.mock("../../src/login/bekk/bekkLogin", () => ({ getEmployeeId: () => 42 }));
const get = vi.mocked(bekkClient.GET);
const from = IsoDate.parse("2025-02-03");
const to = IsoDate.parse("2025-02-04");
const ok = (data: unknown) => ({ response: { ok: true }, data }) as never;

beforeEach(() => {
	get.mockReset();
});

describe("loadInternalWorklogs", () => {
	test("flattens multiple timecodes and preserves repeated entries", async () => {
		get.mockResolvedValue(
			ok({
				timecodeTimeEntries: [
					{
						timecode: { id: 201 },
						entries: [
							{ timecodeId: 201, date: "2025-02-03T00:00:00+01:00", hours: 2 },
							{ timecodeId: 201, date: "2025-02-03T00:00:00+01:00", hours: 3 },
						],
					},
					{
						timecode: { id: 202 },
						entries: [{ date: "2025-02-04T00:00:00+01:00", hours: 1 }],
					},
				],
			}),
		);

		await expect(loadInternalWorklogs(from, to)).resolves.toEqual([
			{ timecodeId: 201, date: from, hoursWorked: 2 },
			{ timecodeId: 201, date: from, hoursWorked: 3 },
			{ timecodeId: 202, date: to, hoursWorked: 1 },
		]);
		expect(get).toHaveBeenCalledExactlyOnceWith(
			"/v3/timesheets/employees/{employeeId}",
			{
				params: { path: { employeeId: 42 }, query: { From: from, To: to } },
			},
		);
	});

	test("accepts a successful timesheet with no entries", async () => {
		get.mockResolvedValue(ok({ timecodeTimeEntries: [] }));
		await expect(loadInternalWorklogs(from, to)).resolves.toEqual([]);
	});

	test("rejects failures and absent timesheet data", async () => {
		get
			.mockResolvedValueOnce({ response: { ok: false } } as never)
			.mockResolvedValueOnce(ok({}));
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"Failed to load Internal timesheet",
		);
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"Failed to load Internal timesheet",
		);
	});

	test("rejects malformed entries rather than treating them as zero hours", async () => {
		get.mockResolvedValue(
			ok({
				timecodeTimeEntries: [
					{
						timecode: { id: 201 },
						entries: [{ date: "2025-02-03T00:00:00+01:00" }],
					},
				],
			}),
		);
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"Invalid Internal timesheet entry",
		);
	});

	test("rejects an entry outside the requested dates", async () => {
		get.mockResolvedValue(
			ok({
				timecodeTimeEntries: [
					{
						timecode: { id: 201 },
						entries: [{ date: "2025-02-05T00:00:00+01:00", hours: 2 }],
					},
				],
			}),
		);
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"outside requested range",
		);
	});

	test("interprets date-only and timezone-free timestamps as calendar dates", async () => {
		get.mockResolvedValue(
			ok({
				timecodeTimeEntries: [
					{
						timecode: { id: 201 },
						entries: [
							{ date: "2025-02-03", hours: 1 },
							{ date: "2025-02-04T23:30:00", hours: 2 },
						],
					},
				],
			}),
		);
		await expect(loadInternalWorklogs(from, to)).resolves.toEqual([
			{ date: from, timecodeId: 201, hoursWorked: 1 },
			{ date: to, timecodeId: 201, hoursWorked: 2 },
		]);
	});

	test("converts offset-bearing timestamps to the Oslo work date", async () => {
		get.mockResolvedValue(
			ok({
				timecodeTimeEntries: [
					{
						timecode: { id: 201 },
						entries: [{ date: "2025-02-02T23:30:00Z", hours: 1 }],
					},
				],
			}),
		);
		await expect(loadInternalWorklogs(from, to)).resolves.toEqual([
			{ date: from, timecodeId: 201, hoursWorked: 1 },
		]);
	});

	test("rejects an invalid calendar date and a timecode mismatch", async () => {
		get
			.mockResolvedValueOnce(
				ok({
					timecodeTimeEntries: [
						{
							timecode: { id: 201 },
							entries: [{ date: "2025-02-30", hours: 1 }],
						},
					],
				}),
			)
			.mockResolvedValueOnce(
				ok({
					timecodeTimeEntries: [
						{
							timecode: { id: 201 },
							entries: [{ date: "2025-02-03", hours: 1, timecodeId: 202 }],
						},
					],
				}),
			);
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"Invalid Internal timesheet entry",
		);
		await expect(loadInternalWorklogs(from, to)).rejects.toThrow(
			"Internal timecode ID mismatch",
		);
	});
});
