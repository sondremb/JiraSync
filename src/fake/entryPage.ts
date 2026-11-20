import { setUpScenario } from "./scenarioSetup";
import {
	readFakeSettings,
	resolveFakeEntry,
	writeFakeSettings,
} from "./settings";

// Runs on the dev-only /__fake page (see vitePlugin.ts), outside the app and its router.
const result = resolveFakeEntry(
	new URLSearchParams(window.location.search),
	readFakeSettings(sessionStorage),
);
if (result.ok) {
	writeFakeSettings(sessionStorage, result.settings);
	if (result.resetScenario) setUpScenario(result.settings.scenario);
	window.location.replace(result.next);
} else {
	document.getElementById("status")!.textContent = result.error;
}
