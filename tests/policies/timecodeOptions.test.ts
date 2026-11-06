import { describe, expect, test } from "vitest";
import {
	isOfferedTimecode,
	matchesTimecode,
	offeredTimecodes,
	timecodeLabel,
} from "../../src/policies/timecodeOptions";

describe("timecode options", () => {
	test("label is code and name", () => {
		expect(timecodeLabel({ code: "UDI1000", name: "Forvaltning" })).toBe(
			"UDI1000 Forvaltning",
		);
	});

	test("matches a substring of code or name, ignoring case", () => {
		const label = "UDI1000 Forvaltning";
		expect(matchesTimecode("udi1", label)).toBe(true);
		expect(matchesTimecode("VALT", label)).toBe(true);
		expect(matchesTimecode("  forv ", label)).toBe(true);
		expect(matchesTimecode("", label)).toBe(true);
		expect(matchesTimecode("drift", label)).toBe(false);
	});

	test("offers active timecodes and the current one", () => {
		expect(isOfferedTimecode({ id: 1, active: true }, null)).toBe(true);
		expect(isOfferedTimecode({ id: 2, active: false }, null)).toBe(false);
		expect(isOfferedTimecode({ id: 2, active: false }, 2)).toBe(true);
		expect(isOfferedTimecode({ id: 2, active: false }, 3)).toBe(false);
	});
});

describe("offeredTimecodes", () => {
	const all = [
		{ id: 1, code: "A1", name: "Aktiv", active: true },
		{ id: 2, code: "I2", name: "Inaktiv", active: false },
	];

	test("active timecodes when nothing is selected", () => {
		expect(offeredTimecodes(all, null).map((o) => o.id)).toEqual([1]);
	});

	test("keeps an inactive current timecode", () => {
		expect(offeredTimecodes(all, 2).map((o) => o.id)).toEqual([1, 2]);
	});

	test("adds a placeholder for a current timecode missing from the list", () => {
		expect(offeredTimecodes([], 7)).toEqual([
			{ id: 7, code: "Timekode 7", name: "", active: false },
		]);
		expect(offeredTimecodes(all, 7).map((o) => o.id)).toEqual([7, 1]);
	});
});
