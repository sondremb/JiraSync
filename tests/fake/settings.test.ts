import { describe, expect, test } from "vitest";
import {
	readFakeSettings,
	resolveFakeEntry,
	writeFakeSettings,
} from "../../src/fake/settings";

const entry = (
	query: string,
	current = null as Parameters<typeof resolveFakeEntry>[1],
) => resolveFakeEntry(new URLSearchParams(query), current);

describe("resolveFakeEntry", () => {
	test("a scenario replaces the current settings", () => {
		expect(
			entry("scenario=logged-out", { scenario: "default", loggedOut: false }),
		).toEqual({
			ok: true,
			settings: { scenario: "logged-out", loggedOut: true },
			resetScenario: true,
			next: "/",
		});
	});

	test("an unknown scenario is rejected", () => {
		expect(entry("scenario=nope")).toMatchObject({ ok: false });
	});

	test("without a scenario and without settings, the default scenario is set up", () => {
		expect(entry("")).toEqual({
			ok: true,
			settings: { scenario: "default", loggedOut: false },
			resetScenario: true,
			next: "/",
		});
	});

	test("login keeps the current scenario and only logs back in", () => {
		expect(
			entry("login&next=/policy", {
				scenario: "no-lock-date",
				loggedOut: true,
			}),
		).toEqual({
			ok: true,
			settings: { scenario: "no-lock-date", loggedOut: false },
			resetScenario: false,
			next: "/policy",
		});
	});

	test("next keeps the product URL's path, query and hash", () => {
		expect(
			entry(`scenario=default&next=${encodeURIComponent("/?week=2026-W40#x")}`),
		).toMatchObject({ next: "/?week=2026-W40#x" });
	});

	test.each([
		"https://evil.example/",
		"//evil.example/",
		"/\\evil.example/",
		"javascript:alert(1)",
		"policy",
		"/__fake?scenario=default",
	])("next %s falls back to /", (next) => {
		expect(
			entry(`scenario=default&next=${encodeURIComponent(next)}`),
		).toMatchObject({ next: "/" });
	});
});

describe("readFakeSettings", () => {
	test("keeps settings it doesn't know, so a logout doesn't drop them", () => {
		const stored = new Map<string, string>();
		const storage = {
			getItem: (key: string) => stored.get(key) ?? null,
			setItem: (key: string, value: string) => void stored.set(key, value),
		};
		stored.set(
			"jirasync.fake",
			JSON.stringify({ scenario: "default", loggedOut: false, fail: "x" }),
		);

		const settings = readFakeSettings(storage)!;
		writeFakeSettings(storage, { ...settings, loggedOut: true });

		expect(JSON.parse(stored.get("jirasync.fake")!)).toEqual({
			scenario: "default",
			loggedOut: true,
			fail: "x",
		});
	});
});
