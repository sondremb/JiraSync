import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { IsoWeek } from "./IsoWeek";

describe("It formats correctly", () => {
	test("Single digit weeks are padded", () => {
		const startOfWeek = new Date("2024-12-30T23:00:00.000Z");
		expect(IsoWeek.fromDate(startOfWeek)).toBe("2025-W01");
	});

	test("Double digit weeks are not padded", () => {
		const startOfWeek = new Date("2024-03-04T23:00:00.000Z");
		expect(IsoWeek.fromDate(startOfWeek)).toBe("2024-W10");
	});
});

describe("It uses correct ISOWeek for dates around new years", () => {
	// ISO week bestemmes av hvilket år torsdagen i den uka tilhører

	test("When january 1st is thursday or earlier", () => {
		// 1. januar 2025 er en onsdag
		// Altså er uka 30. desember 2024 - 5. januar 2025 ISO-week 2025-W01
		const mondayDecember30th = new Date("2024-12-30T12:00:00.000Z");
		expect(IsoWeek.fromDate(mondayDecember30th)).toBe("2025-W01");

		const wednesdayJanuary1st = new Date("2025-01-01T12:00:00.000Z");
		expect(IsoWeek.fromDate(wednesdayJanuary1st)).toBe("2025-W01");
	});

	test("When january 1st is friday or later", () => {
		// 1. januar 2027 er en fredag
		// Altså er uka 28. desember 2026 - 3. januar 2027 ISO-week 2026-W53
		const mondayDecember28th = new Date("2026-12-28T12:00:00.000Z");
		expect(IsoWeek.fromDate(mondayDecember28th)).toBe("2026-W53");

		const fridayJanuary1st = new Date("2027-01-01T12:00:00.000Z");
		expect(IsoWeek.fromDate(fridayJanuary1st)).toBe("2026-W53");
	});
});

describe("It uses norwegian time", () => {
	describe("When timezone is set to norway", () => {
		let originalTZ: string | undefined;
		beforeAll(() => {
			originalTZ = process.env.TZ;
			process.env.TZ = "Europe/Oslo";
		});

		afterAll(() => {
			process.env.TZ = originalTZ;
		});

		test("Time zone sanity check", () => {
			expect(new Date("2025-01-01").getTimezoneOffset()).toBe(-60);
			expect(new Date("2025-06-01").getTimezoneOffset()).toBe(-60 * 2);
		});

		test("It does not change the week before 22:00 UTC during summer time", () => {
			const justBeforeMidnight = new Date("2025-06-29T21:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W26");
		});

		test("It changes the week after 22:00 UTC during summer time", () => {
			const justAfterMidnight = new Date("2025-06-29T22:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W27");
		});

		test("It does not change the week before 23:00 UTC during winter time", () => {
			const justBeforeMidnight = new Date("2025-12-21T22:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W51");
		});

		test("It changes the week after 23:00 UTC during winter time", () => {
			const justAfterMidnight = new Date("2025-12-21T23:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W52");
		});
	});

	describe("When timezone is set to something else entirely", () => {
		let originalTZ: string | undefined;
		beforeAll(() => {
			originalTZ = process.env.TZ;
			process.env.TZ = "Asia/Tokyo";
		});

		afterAll(() => {
			process.env.TZ = originalTZ;
		});

		test("Time zone sanity check", () => {
			// Japan er UTC +9 hele året
			expect(new Date("2025-01-01").getTimezoneOffset()).toBe(-60 * 9);
		});

		test("It does not change the week before 22:00 UTC during summer time", () => {
			const justBeforeMidnight = new Date("2025-06-29T21:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W26");
		});

		test("It changes the week after 22:00 UTC during summer time", () => {
			const justAfterMidnight = new Date("2025-06-29T22:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W27");
		});

		test("It does not change the week before 23:00 UTC during winter time", () => {
			const justBeforeMidnight = new Date("2025-12-21T22:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W51");
		});

		test("It changes the week after 23:00 UTC during winter time", () => {
			const justAfterMidnight = new Date("2025-12-21T23:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W52");
		});
	});
});
