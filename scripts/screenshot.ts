// Takes a screenshot of the app running against the fake backend.
// Starts its own Vite dev server on a free port, so no `pnpm start` is needed.
// Usage: pnpm screenshot [--scenario default] [--width 1280] [--height 800]
//          [--full-page] [--wait-for <selector>] <product URL> <out.png>
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { createServer } from "vite";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		scenario: { type: "string", default: "default" },
		width: { type: "string", default: "1280" },
		height: { type: "string", default: "800" },
		"full-page": { type: "boolean", default: false },
		"wait-for": { type: "string" },
	},
});
const [url, out] = positionals;
if (!url?.startsWith("/") || !out || positionals.length !== 2) {
	console.error(
		"Usage: pnpm screenshot [--scenario <name>] [--width <px>] [--height <px>] [--full-page] [--wait-for <selector>] <product URL starting with /> <out.png>",
	);
	process.exit(2);
}

// VITE_* vars in process.env win over .env files. VITE_DEBUG off hides the router devtools.
process.env.VITE_FAKE_BACKEND = "true";
process.env.VITE_DEBUG = "false";
const server = await createServer({
	logLevel: "warn",
	server: { strictPort: false, open: false },
});

try {
	await server.listen();
	const base = server.resolvedUrls?.local[0];
	if (!base) throw new Error("Vite did not report a local URL");

	// Prefer the installed Chrome; fall back to Playwright's Chromium.
	const browser = await chromium
		.launch({ channel: "chrome" })
		.catch(() => chromium.launch());
	try {
		const page = await browser.newPage({
			viewport: { width: Number(values.width), height: Number(values.height) },
		});
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));

		const entry = new URL("/__fake", base);
		entry.searchParams.set("scenario", values.scenario);
		entry.searchParams.set("next", url);
		await page.goto(entry.href);
		// /__fake sets up the scenario and redirects to the product URL.
		await page.waitForURL((current) => current.pathname !== "/__fake");
		await page.waitForLoadState("networkidle");
		await page.waitForFunction(
			() => document.querySelectorAll(".ds-skeleton").length === 0,
		);
		if (values["wait-for"]) await page.waitForSelector(values["wait-for"]);

		await page.screenshot({ path: out, fullPage: values["full-page"] });
		console.log(`Saved ${out} (${page.url()})`);
		if (errors.length > 0) {
			console.warn("Page errors:\n" + errors.join("\n"));
		}
	} finally {
		await browser.close();
	}
} finally {
	await server.close();
}
