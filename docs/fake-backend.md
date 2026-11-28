# Fake backend (`src/fake/`, local dev only)

`pnpm start:fake` runs the app logged in to Jira and Bekk against in-memory fake data, with no `.env`. Use it for screenshots and layout checks.

- **Gate:**
  - `isFakeBackend` (`src/Utils/envUtils.ts`) is `import.meta.env.DEV && VITE_FAKE_BACKEND === "true"`, so `pnpm build` can't turn it on. With the flag, `getConfigValue` falls back to placeholders for missing env vars.
  - `index.tsx` dynamically imports `src/fake/browser.ts` behind the flag and renders once the fake has started.
  - `pnpm build` runs `scripts/check-no-fake-in-dist.ts`, which fails if fake code reaches `dist/`. Keep fake-only code behind `isFakeBackend` so the build drops it.
- **APIs:**
  - The Jira and Bekk APIs and the Jira login functions are faked with MSW below `fetch` (`handlers.ts`, typed with `src/generated/*.d.ts`). The real clients, loaders and 401 retry run unchanged.
  - Auth function paths come from `src/login/jira/authPaths.ts`, which the app, the Netlify functions and the handlers share.
  - An API request without a handler fails (`browser.ts`). Same-origin page loads, modules and assets go to the Vite dev server: MSW 3's worker forwards page loads too.
- **Bekk login** is faked at a seam: in fake mode `msalInstance` is `createFakeMsal()` (`fakeMsal.ts`), `BekkEntraLogin` renders its children, and `PublicClientApplication` is never constructed.
- **Data:**
  - `fixtures.ts` is dated relative to today's ISO week:
    - this week has changes to sync, an unmatched Jira worklog and an unmanaged entry
    - last week is locked (the lock date is its Sunday), with a day that disagrees with Jira
    - two weeks back is in sync
  - The app opens on the week after the lock date, i.e. this week.
  - Writes and locking change `fakeStore.ts` in memory; a reload resets them.
  - Every unsigned month has the same overtime (November 2026's from Bekk dev: 9.5 t, of which 0.5 t mandatory flex and 1.5 t mandatory payout), and July and December add a half-year flex clearing. Like Bekk, a lock that closes a month is rejected unless it signs that month's overtime. To see the overtime dialog, go to the week holding the month's last day and lock through it.
  - `jql.ts` evaluates only `project`, `component` and `key` clauses; other JQL fails loudly in `/jql/match`.
- **Scenarios:**
  - Open `/__fake?scenario=<name>&next=<product URL>`, served by `vitePlugin.ts` outside the app and its router. It writes settings to sessionStorage (`settings.ts`), sets up the app's storage for the scenario (`scenarioSetup.ts`), and redirects to `next` (default `/`).
  - Scenarios: `default`, `local-ruleset`, `no-lock-date`, `logged-out`. `/__fake?login&next=/` logs back in, keeping the scenario.
  - Read fake settings only from sessionStorage, never from product URLs or routes.
- **Screenshots:** `pnpm screenshot [--scenario <name>] [--full-page] [--wait-for <selector>] <product URL> <out.png>` (`scripts/screenshot.ts`).
  - It starts its own Vite dev server with the fake backend on a free port, so no `pnpm start` is needed, opens `/__fake?scenario=<name>&next=<product URL>` in headless Chrome via Playwright, and waits for the redirect, network idle and no Designsystemet skeletons (`.ds-skeleton`). Pass `--wait-for` for anything else the page needs.
  - `--date YYYY-MM-DD` fixes the browser's clock to noon that day. The fixtures follow, so the app looks as it would on that date. Use it for anything tied to the calendar, such as the month check, which only shows around a month end (`--date 2026-12-31` shows December out of sync).
  - It uses the installed Chrome, falling back to Playwright's Chromium (`pnpm exec playwright install chromium`). It forces `VITE_DEBUG` off so the router devtools stay out of the shot. `--width`/`--height` set the viewport (default 1280×800).
  - Example: `pnpm screenshot --scenario local-ruleset --full-page /policy policy.png`.
  - Chrome's own `--headless --screenshot` doesn't work: `--virtual-time-budget` skips past the service worker start, and without it the shot is taken before the app renders.
- **Tests:** `tests/fake/` tests the fixtures through reconciliation, the store's writes and `/__fake` settings parsing.
