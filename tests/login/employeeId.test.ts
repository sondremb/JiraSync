import type { AccountInfo } from "@azure/msal-browser";
import { describe, expect, test } from "vitest";
import { employeeIdOf } from "../../src/login/bekk/employeeId";

const withClaims = (idTokenClaims: AccountInfo["idTokenClaims"]) =>
	({ idTokenClaims }) as AccountInfo;

describe("employeeIdOf", () => {
	test("parses the employeeId claim", () => {
		expect(employeeIdOf(withClaims({ employeeId: "4242" }))).toBe(4242);
	});

	test("undefined without an account or a usable claim", () => {
		expect(employeeIdOf(null)).toBeUndefined();
		expect(employeeIdOf(withClaims({}))).toBeUndefined();
		expect(employeeIdOf(withClaims({ employeeId: "" }))).toBeUndefined();
		expect(employeeIdOf(withClaims({ employeeId: "abc" }))).toBeUndefined();
	});
});
