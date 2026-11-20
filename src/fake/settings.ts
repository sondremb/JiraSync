import type { KeyValueStorage } from "../Utils/safeStorage";

/**
 * Settings for the fake backend. They live in sessionStorage only, written by
 * the dev-only `/__fake` entry page, so product URLs and routes never see them.
 */

export const fakeScenarios = [
	"default",
	"local-ruleset",
	"no-lock-date",
	"logged-out",
] as const;
export type FakeScenario = (typeof fakeScenarios)[number];

/** Fields this module doesn't know are kept when read and written back. */
export interface FakeSettings {
	scenario: FakeScenario;
	/** The fake Jira session is logged out: `jira-auth-session` answers 401. */
	loggedOut: boolean;
}

export const fakeSettingsKey = "jirasync.fake";

export function readFakeSettings(
	storage: KeyValueStorage,
): FakeSettings | null {
	try {
		const text = storage.getItem(fakeSettingsKey);
		if (text === null) return null;
		const raw = JSON.parse(text) as Partial<FakeSettings>;
		if (!isScenario(raw.scenario)) return null;
		return {
			...raw,
			scenario: raw.scenario,
			loggedOut: raw.loggedOut === true,
		};
	} catch {
		return null;
	}
}

export function writeFakeSettings(
	storage: KeyValueStorage,
	settings: FakeSettings,
) {
	storage.setItem(fakeSettingsKey, JSON.stringify(settings));
}

export function settingsForScenario(scenario: FakeScenario): FakeSettings {
	return { scenario, loggedOut: scenario === "logged-out" };
}

export type FakeEntryResult =
	| {
			ok: true;
			settings: FakeSettings;
			/** Set up the scenario's app state (selected ruleset, local rulesets) again. */
			resetScenario: boolean;
			/** Same-origin product URL to continue to. */
			next: string;
	  }
	| { ok: false; error: string };

/**
 * What a visit to `/__fake?scenario=<name>&login&next=<url>` does:
 * - `scenario` replaces all settings with the scenario's
 * - `login` logs the fake Jira session back in and keeps the scenario
 * - `next` is where to continue, `/` unless it is a same-origin path
 */
export function resolveFakeEntry(
	params: URLSearchParams,
	current: FakeSettings | null,
): FakeEntryResult {
	const scenario = params.get("scenario");
	if (scenario !== null && !isScenario(scenario)) {
		return {
			ok: false,
			error: `Unknown scenario "${scenario}". Use one of: ${fakeScenarios.join(", ")}.`,
		};
	}
	const resetScenario = scenario !== null || current === null;
	let settings =
		scenario !== null
			? settingsForScenario(scenario)
			: (current ?? settingsForScenario("default"));
	if (params.has("login")) {
		settings = { ...settings, loggedOut: false };
	}
	return {
		ok: true,
		settings,
		resetScenario,
		next: safeNext(params.get("next")),
	};
}

function safeNext(next: string | null): string {
	// A single leading slash keeps it on this origin; "//" and "/\" would leave it.
	if (
		next === null ||
		!/^\/(?![/\\])/.test(next) ||
		next.startsWith("/__fake")
	) {
		return "/";
	}
	return next;
}

function isScenario(value: unknown): value is FakeScenario {
	return fakeScenarios.includes(value as FakeScenario);
}
