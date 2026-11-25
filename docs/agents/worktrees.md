# Worktrees

Work on each issue in its own git worktree, branched from `origin/main`, so parallel agents don't share a checkout. Use workmux if it is installed (`command -v workmux`); otherwise use plain git. Both give the same result.

## With workmux

`.workmux.yaml` branches from `origin/main`, copies `.env` from the checkout you run `workmux add` in (usually the main checkout) and runs `pnpm install`. The tmux window has the agent on the left, and on the right the fake-backend dev server above a shell.

```bash
git fetch
workmux add <n>-<slug>            # worktree, tmux window and agent
workmux add <n>-<slug> --headless # worktree only, no tmux needed
```

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

- Real logins only work on port 5173: the Jira OAuth and Entra redirect URIs are registered for `http://localhost:5173`. Only one worktree at a time can run `pnpm start` against the real backends.
- Every other worktree uses `VITE_FAKE_BACKEND=true pnpm start` (Vite moves to a free port), which needs no `.env`. `pnpm screenshot`, the tests, lint and typecheck also run without `.env`.
- Generated types (`src/generated/`, `src/routeTree.gen.ts`) are committed, so a fresh worktree builds without `pnpm generate`.
