// The dev server of this checkout. See docs/agents/worktrees.md.
//
//   pnpm dev:url (node scripts/dev-server.ts url)
//                                  prints the URL of the dev server started from this checkout
//   node scripts/dev-server.ts fake  (re)starts it against the fake backend, on any free port
//   node scripts/dev-server.ts real  (re)starts it against the real Jira and Bekk dev on port 5173,
//                                    stopping whatever else listens there first
//
// fake and real restart the server in the dev-server pane of this workmux window
// (the second pane, see .workmux.yaml), so they need tmux. The server's output also
// goes to .dev-server.log in the checkout.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const REAL_PORT = 5173;
const LOG = ".dev-server.log";

/** Runs a command and returns its stdout, or "" when it fails (lsof exits 1 when nothing matches). */
function run(command: string, args: string[]): string {
	try {
		return execFileSync(command, args, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return "";
	}
}

const root = run("git", ["rev-parse", "--show-toplevel"]).trim();

function pids(lsofArgs: string[]): string[] {
	return [
		...new Set(
			run("lsof", ["-t", ...lsofArgs])
				.split("\n")
				.filter(Boolean),
		),
	];
}

function cwdOf(pid: string): string {
	const line = run("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"])
		.split("\n")
		.find((l) => l.startsWith("n"));
	return line?.slice(1) ?? "";
}

/**
 * The localhost URL of the dev server whose cwd is this checkout, or undefined.
 * Vite listens on localhost; the Netlify plugin's wildcard (*:port) listener is skipped.
 */
function devUrl(): string | undefined {
	for (const pid of pids(["-a", "-c", "node", "-iTCP", "-sTCP:LISTEN"])) {
		if (cwdOf(pid) !== root) continue;
		const port = run("lsof", [
			"-a",
			"-p",
			pid,
			"-iTCP",
			"-sTCP:LISTEN",
			"-P",
			"-Fn",
		])
			.split("\n")
			.filter((l) => l.startsWith("n") && !l.startsWith("n*"))
			.map((l) => l.slice(l.lastIndexOf(":") + 1))[0];
		if (port) return `http://localhost:${port}/`;
	}
	return undefined;
}

/** Polls `done` once a second, up to `seconds` times. */
async function waitFor(seconds: number, done: () => boolean): Promise<boolean> {
	for (let i = 0; i < seconds; i++) {
		if (done()) return true;
		await sleep(1000);
	}
	return done();
}

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

async function restart(command: string): Promise<void> {
	const self = process.env.TMUX_PANE;
	if (!self) fail(`Not in tmux. Run '${command}' in this checkout yourself.`);
	const pane = run("tmux", [
		"list-panes",
		"-t",
		self,
		"-F",
		"#{pane_index} #{pane_id}",
	])
		.split("\n")
		.filter(Boolean)
		.map((l) => l.split(" "))
		.sort((a, b) => Number(a[0]) - Number(b[0]))[1]?.[1];
	if (!pane)
		fail(`No dev-server pane in this tmux window. Run '${command}' yourself.`);

	// Ctrl-C stops the running server and keeps the pane's shell.
	run("tmux", ["send-keys", "-t", pane, "C-c"]);
	// Wait for the old server to exit, so its URL isn't mistaken for the new one.
	await waitFor(10, () => devUrl() === undefined);
	run("tmux", [
		"send-keys",
		"-t",
		pane,
		`${command} 2>&1 | tee ${LOG}`,
		"Enter",
	]);

	let url: string | undefined;
	if (await waitFor(30, () => (url = devUrl()) !== undefined)) {
		console.log(url);
		return;
	}
	let log = "";
	try {
		log = readFileSync(join(root, LOG), "utf8")
			.split("\n")
			.slice(-20)
			.join("\n");
	} catch {}
	fail(`The server did not come up within 30 s. Its output:\n${log}`);
}

switch (process.argv[2]) {
	case "url": {
		const url = devUrl();
		if (!url) fail(`No dev server is running from ${root}.`);
		console.log(url);
		break;
	}
	case "fake":
		await restart("pnpm start:fake");
		break;
	case "real": {
		let killed = false;
		for (const pid of pids([`-iTCP:${REAL_PORT}`, "-sTCP:LISTEN"])) {
			const cwd = cwdOf(pid);
			if (cwd === root) continue;
			console.error(
				`Stopping the server on port ${REAL_PORT} from ${cwd} (pid ${pid}).`,
			);
			process.kill(Number(pid));
			killed = true;
		}
		// Wait for the port to free up, so Vite doesn't fail on --strictPort.
		if (killed)
			await waitFor(
				10,
				() => pids([`-iTCP:${REAL_PORT}`, "-sTCP:LISTEN"]).length === 0,
			);
		await restart("pnpm start");
		break;
	}
	default:
		console.error("Usage: node scripts/dev-server.ts url|fake|real");
		process.exit(2);
}
