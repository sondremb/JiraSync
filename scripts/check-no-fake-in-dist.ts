// Fails the build if anything from the dev-only fake backend (src/fake/, MSW)
// ended up in dist/. Run after `vite build`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const markers = [
	"mockServiceWorker",
	"setupWorker",
	"__fake",
	"fake-jira-access-token",
	"fake-bekk-access-token",
	"Demo Demosen",
	"jirasync.fake",
];

const files = readdirSync(dist, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile())
	.map((entry) => join(entry.parentPath, entry.name));

const problems = files.flatMap((file) => {
	if (file.includes("mockServiceWorker")) return [`${file} exists`];
	if (!/\.(js|html|css|json|map)$/.test(file)) return [];
	const text = readFileSync(file, "utf8");
	return markers
		.filter((marker) => text.includes(marker))
		.map((marker) => `${file} contains "${marker}"`);
});

if (problems.length > 0) {
	console.error("Fake backend code found in dist/:\n" + problems.join("\n"));
	process.exit(1);
}
console.log(`No fake backend code in dist/ (${files.length} files checked).`);
