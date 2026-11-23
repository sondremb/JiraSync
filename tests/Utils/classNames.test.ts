import { describe, expect, test } from "vitest";
import { classNames } from "../../src/Utils/classNames";

describe("classNames", () => {
	test("joins names with spaces", () => {
		expect(classNames("block", "block--modifier")).toBe(
			"block block--modifier",
		);
	});

	test("skips false, null, undefined and empty strings", () => {
		expect(classNames("block", false, null, undefined, "", "extra")).toBe(
			"block extra",
		);
	});

	test("no names give an empty string", () => {
		expect(classNames()).toBe("");
		expect(classNames(false, undefined)).toBe("");
	});
});
