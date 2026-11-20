# Fake backend (`src/fake/`, local dev only)

`VITE_FAKE_BACKEND=true pnpm start` runs the app logged in to Jira and Bekk against in-memory fake data, with no `.env`. Use it for screenshots and layout checks.

- **Gate:**
  - `isFakeBackend` (`src/Utils/envUtils.ts`) is `import.meta.env.DEV && VITE_FAKE_BACKEND === "true"`, so `pnpm build` can't turn it on. With the flag, `getConfigValue` falls back to placeholders for missing env vars.
  - `index.tsx` dynamically imports `src/fake/browser.ts` behind the flag and renders once the fake has started.
  - `pnpm build` runs `scripts/check-no-fake-in-dist.mjs`, which fails if fake code reaches `dist/`. Keep fake-only code behind `isFakeBackend` so the build drops it.
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
  - `jql.ts` evaluates only `project`, `component` and `key` clauses; other JQL fails loudly in `/jql/match`.
- **Scenarios:**
  - Open `/__fake?scenario=<name>&next=<product URL>`, served by `vitePlugin.ts` outside the app and its router. It writes settings to sessionStorage (`settings.ts`), sets up the app's storage for the scenario (`scenarioSetup.ts`), and redirects to `next` (default `/`).
  - Scenarios: `default`, `local-ruleset`, `no-lock-date`, `logged-out`. `/__fake?login&next=/` logs back in, keeping the scenario.
  - Read fake settings only from sessionStorage, never from product URLs or routes.
- **Screenshots:** take them ad hoc with a browser tool that can wait for the page, starting from `http://localhost:5173/__fake?scenario=<name>&next=<url>`. Chrome's `--headless --screenshot` doesn't work: `--virtual-time-budget` skips past the service worker start, and without it the shot is taken before the app renders.
- **Tests:** `tests/fake/` tests the fixtures through reconciliation, the store's writes and `/__fake` settings parsing.
