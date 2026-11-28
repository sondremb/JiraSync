# Worktrees

Work on each issue in its own git worktree, branched from `origin/main`, so parallel agents don't share a checkout. Use workmux if it is installed (`command -v workmux`); otherwise use plain git. Both give the same result.

## With workmux

`.workmux.yaml` branches from `origin/main`, copies `.env` from the checkout you run `workmux add` in (usually the main checkout) and runs `pnpm install`. The tmux window has the agent on the left, and on the right the fake-backend dev server above a shell.

```bash
git fetch
workmux add <handle> -p "<prompt>" # worktree, tmux window and agent
workmux add <handle> --headless    # worktree only, no tmux needed
```

The user picks a short handle (`workmux add lock-dates -p "We're implementing #42"`), which names the worktree, the tmux window and, at first, the branch. **Branches are named `<n>-<slug>`**, where `<n>` is the issue number. So when an agent starts in a worktree whose branch lacks the issue number, its first step is to rename the branch, without being asked: `git branch -m <n>-<handle>`, keeping the handle as the slug. Leave the worktree and the tmux window as they are. When the prompt names a feature instead of a number ("we're implementing the download feature"), it still means an existing issue: find it with `gh issue list --state open --search "<words>"`. If exactly one issue fits, use its number. If several fit or none does, ask the user which one before you rename.

Worktrees go in `../JiraSync__worktrees/<handle>`; `workmux path <handle>` prints one. Once the PR is merged on GitHub, clean up with `workmux rm --gone`. Don't use `workmux merge`: changes reach `main` through PRs.

## Without workmux

```bash
git fetch
git worktree add -b <n>-<slug> ../JiraSync__worktrees/<n>-<slug> origin/main
cd ../JiraSync__worktrees/<n>-<slug>
cp ../../JiraSync/.env . 2>/dev/null  # optional, see below
pnpm install --frozen-lockfile --prefer-offline
```

After the PR is merged: `git worktree remove ../JiraSync__worktrees/<n>-<slug>` and `git branch -D <n>-<slug>`.

## Running the app in a worktree

- `pnpm start:fake` runs against the fake backend, which needs no `.env` and works on any port (Vite moves to a free one). It's what the dev-server pane of a workmux window runs. `pnpm screenshot`, the tests, lint and typecheck also run without `.env`.
- `pnpm start` runs against the real Jira and Bekk dev (the `.env` points at `api.bekk.dev`). Real logins only work on port 5173: the Jira OAuth and Entra redirect URIs are registered for `http://localhost:5173`. So only one worktree at a time can run it, and it fails instead of moving to another port when 5173 is taken.
- Generated types (`src/generated/`, `src/routeTree.gen.ts`) are committed, so a fresh worktree builds without `pnpm generate`.

`scripts/dev-server.sh` handles this worktree's dev server, so agents don't have to find ports or panes:

```bash
pnpm dev:url                   # the URL of the dev server running from this worktree
sh scripts/dev-server.sh real  # restart it against the real backends on 5173
sh scripts/dev-server.sh fake  # restart it against the fake backend
```

`real` stops whatever else listens on 5173 (usually another worktree's server) and says which checkout it came from; pass that on to the user. `real` and `fake` restart the server in the window's dev-server pane, so they need the workmux tmux window. The server's output, errors included, also goes to `.dev-server.log` in the worktree; read it when the app misbehaves. When the user asks to try a worktree against Bekk dev, or against the real backends, run `real` and give them the URL.
