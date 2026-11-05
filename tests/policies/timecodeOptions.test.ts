import { describe, expect, test } from "vitest";
import {
	isOfferedTimecode,
	matchesTimecode,
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
