import { isCommonAssetRequest } from "msw";
import { setupWorker } from "msw/browser";
import { HttpNetworkFrame } from "msw/experimental";
import { createFakeStore } from "./fakeStore";
import { createHandlers } from "./handlers";
import { setUpScenario } from "./scenarioSetup";
import {
	readFakeSettings,
	settingsForScenario,
	writeFakeSettings,
} from "./settings";

/**
 * Starts the fake backend: MSW answers every Jira, Bekk and Jira-login
 * request from in-memory fixtures. Only loaded in fake mode (see `index.tsx`).
 */
export async function startFakeBackend() {
	let settings = readFakeSettings(sessionStorage);
	if (settings === null) {
		// First visit without /__fake: the default scenario
		settings = settingsForScenario("default");
		writeFakeSettings(sessionStorage, settings);
		setUpScenario(settings.scenario);
	}

	const store = createFakeStore({
		today: new Date(),
		scenario: settings.scenario,
	});
	const worker = setupWorker(...createHandlers(store));
	await worker.start({
		quiet: true,
		// Like the "error" strategy, but lets the Vite dev server's own
		// requests through (modules are often not "common assets").
		onUnhandledFrame: async ({ frame, defaults }) => {
			if (frame instanceof HttpNetworkFrame) {
				const request = frame.data.request;
				if (isDevServerRequest(request) || isCommonAssetRequest(request))
					return;
			}
			defaults.error();
			throw new Error("The fake backend has no handler for this request");
		},
	});
	console.info(
		`[fake backend] scenario "${settings.scenario}". Switch with /__fake?scenario=<name>&next=<url>`,
	);
}

/**
 * Pages, modules, assets and pings the Vite dev server answers itself. Any
 * other same-origin request, like an app `fetch()`, needs a handler.
 */
function isDevServerRequest(request: Request): boolean {
	const url = new URL(request.url);
	if (url.origin !== window.location.origin) return false;
	return (
		// Page loads (/logout, /__fake, …): MSW 3's worker forwards navigations too
		(request.headers.get("Accept") ?? "").includes("text/html") ||
		/^\/(?:@|src\/|node_modules\/|assets\/)/.test(url.pathname) ||
		/\.[a-z0-9]+$/i.test(url.pathname) ||
		request.headers.get("Accept") === "text/x-vite-ping"
	);
}
