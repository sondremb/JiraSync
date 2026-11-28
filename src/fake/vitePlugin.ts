import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { loadEnv, type Plugin } from "vite";

const entryPageHtml = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>JiraSync fake backend</title>
	</head>
	<body>
		<p id="status">Setting up the fake backend…</p>
		<script type="module" src="/src/fake/entryPage.ts"></script>
	</body>
</html>
`;

/**
 * Dev-server-only support for the fake backend (`pnpm start:fake`):
 * - `/mockServiceWorker.js`, MSW's worker, served from node_modules so it never lands in `dist/`
 * - `/__fake?scenario=<name>&next=<url>`, the entry page that sets up a scenario
 */
export function fakeBackendPlugin(): Plugin {
	return {
		name: "jirasync-fake-backend",
		apply: (_, { command, mode }) =>
			command === "serve" &&
			loadEnv(mode, process.cwd(), "VITE_").VITE_FAKE_BACKEND === "true",
		configureServer(server) {
			const workerPath = createRequire(import.meta.url).resolve(
				"msw/mockServiceWorker.js",
			);
			server.middlewares.use(async (req, res, next) => {
				const path = req.url?.split("?")[0];
				if (path === "/mockServiceWorker.js") {
					res.setHeader("Content-Type", "text/javascript");
					res.end(readFileSync(workerPath));
				} else if (path === "/__fake") {
					res.setHeader("Content-Type", "text/html");
					res.end(await server.transformIndexHtml(req.url!, entryPageHtml));
				} else {
					next();
				}
			});
		},
	};
}
