import { describe, expect, it } from "vitest";
import { formatHours, IsoDate } from "./IsoWeek";

describe("IsoDate.formatLong", () => {
	it("formats weekday, day and month in Norwegian", () => {
		expect(IsoDate.formatLong(IsoDate.parse("2026-10-05"))).toBe(
			"Mandag 5. oktober",
		);
		expect(IsoDate.formatLong(IsoDate.parse("2026-10-11"))).toBe(
			"Søndag 11. oktober",
		);
		expect(IsoDate.formatLong(IsoDate.parse("2026-11-01"))).toBe(
			"Søndag 1. november",
		);
	});
});

describe("formatHours", () => {
	it("uses decimal comma", () => {
		expect(formatHours(7.5)).toBe("7,5");
		expect(formatHours(8)).toBe("8");
	});
});
