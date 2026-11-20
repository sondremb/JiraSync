import { readdirSync } from "node:fs";
import { expect, test } from "vitest";

test("scripts/ holds only TypeScript, which Node runs directly (node scripts/foo.ts)", () => {
	const nonTs = readdirSync("scripts").filter((file) => !file.endsWith(".ts"));
	expect(nonTs).toEqual([]);
});
