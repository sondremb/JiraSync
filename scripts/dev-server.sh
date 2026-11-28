#!/bin/sh
# The dev server of this checkout. See docs/agents/worktrees.md.
#
#   pnpm dev:url (or sh scripts/dev-server.sh url)
#                                  prints the URL of the dev server started from this checkout
#   sh scripts/dev-server.sh fake  (re)starts it against the fake backend, on any free port
#   sh scripts/dev-server.sh real  (re)starts it against the real Jira and Bekk dev on port 5173,
#                                  stopping whatever else listens there first
#
# fake and real restart the server in the dev-server pane of this workmux window
# (the second pane, see .workmux.yaml), so they need tmux. The server's output also goes
# to .dev-server.log in the checkout.

set -eu

root=$(git rev-parse --show-toplevel)

# The cwd of a process.
cwd_of() {
	lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'
}

# The localhost URL of the dev server whose cwd is this checkout, or nothing.
# Vite listens on localhost; the Netlify plugin's wildcard (*:port) listener is skipped.
dev_url() {
	for pid in $(lsof -t -a -c node -iTCP -sTCP:LISTEN 2>/dev/null | sort -u); do
		[ "$(cwd_of "$pid")" = "$root" ] || continue
		port=$(lsof -a -p "$pid" -iTCP -sTCP:LISTEN -P -Fn 2>/dev/null | sed -n 's/^n//p' | grep -v '^\*' | sed 's/.*://' | head -1)
		if [ -n "$port" ]; then
			echo "http://localhost:$port/"
			return
		fi
	done
}

restart() {
	if [ -z "${TMUX_PANE:-}" ]; then
		echo "Not in tmux. Run '$1' in this checkout yourself." >&2
		exit 1
	fi
	pane=$(tmux list-panes -t "$TMUX_PANE" -F '#{pane_index} #{pane_id}' | sort -n | sed -n '2s/.* //p')
	if [ -z "$pane" ]; then
		echo "No dev-server pane in this tmux window. Run '$1' yourself." >&2
		exit 1
	fi
	# Ctrl-C stops the running server and keeps the pane's shell.
	tmux send-keys -t "$pane" C-c
	# Wait for the old server to exit, so its URL isn't mistaken for the new one.
	i=0
	while [ -n "$(dev_url)" ] && [ $i -lt 10 ]; do
		sleep 1
		i=$((i + 1))
	done
	tmux send-keys -t "$pane" "$1 2>&1 | tee .dev-server.log" Enter
	i=0
	while [ $i -lt 30 ]; do
		url=$(dev_url)
		if [ -n "$url" ]; then
			echo "$url"
			return
		fi
		sleep 1
		i=$((i + 1))
	done
	echo "The server did not come up within 30 s. Its output:" >&2
	tail -20 "$root/.dev-server.log" >&2
	exit 1
}

case "${1:-}" in
url)
	url=$(dev_url)
	if [ -z "$url" ]; then
		echo "No dev server is running from $root." >&2
		exit 1
	fi
	echo "$url"
	;;
fake)
	restart "pnpm start:fake"
	;;
real)
	for pid in $(lsof -t -iTCP:5173 -sTCP:LISTEN 2>/dev/null); do
		[ "$(cwd_of "$pid")" = "$root" ] && continue
		echo "Stopping the server on port 5173 from $(cwd_of "$pid") (pid $pid)." >&2
		kill "$pid"
		killed=yes
	done
	# Wait for the port to free up, so Vite doesn't fail on --strictPort.
	i=0
	while [ -n "${killed:-}" ] && lsof -t -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1 && [ $i -lt 10 ]; do
		sleep 1
		i=$((i + 1))
	done
	restart "pnpm start"
	;;
*)
	echo "Usage: sh scripts/dev-server.sh url|fake|real" >&2
	exit 2
	;;
esac
