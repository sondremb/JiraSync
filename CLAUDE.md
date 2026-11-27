# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start           # Start dev server (Vite)
VITE_FAKE_BACKEND=true pnpm start  # Dev server against the fake backend, no logins or .env needed
pnpm build           # Build for production
pnpm test            # Run vitest tests
pnpm lint            # Lint with oxlint
pnpm typecheck       # Type-check with tsc
pnpm format          # Format with oxfmt (pnpm format:check to verify)
pnpm generate:bekk   # Regenerate Bekk API types from OpenAPI schema
pnpm generate:jira   # Regenerate Jira API types from OpenAPI schema
pnpm generate        # Calls generate:bekk and generate:jira
pnpm screenshot --scenario default / out.png  # Screenshot against the fake backend, see docs/fake-backend.md
```

Always use `pnpm`, not `npm`, `npx`, or `yarn`.

## Architecture

JiraSync is a React/TypeScript SPA deployed on Netlify that synchronizes time tracking between **Jira** and **Bekk Timekeeper**. It loads Jira worklogs and Bekk entries, maps Jira issues to Bekk timecodes with the selected policy, and syncs the Jira hours into Bekk. Sync only goes from Jira to Bekk.

### Data flow

1. User logs in via **Jira OAuth** (Atlassian OAuth 2.0 with PKCE) and **Bekk MSAL** (Azure Entra ID)
2. `useWeeklyReconciliation` hook loads Jira worklogs and Bekk entries for a given ISO week
3. The selected policy (a ruleset, either bundled from `src/policies/policies.json` or local) routes Jira worklogs → Bekk timecodes via JQL matching
4. `reconcilePeriod` compares the two datasets and produces `DayReport[]`
5. `WeeklyReconciliation` renders the weekly grid, sync preview, and locking controls

### Rulesets (`src/policies/`)

A ruleset is the current kind of **policy**. `src/policies/policies.json` holds the **bundled rulesets** — a versioned JSON file validated by the zod schema in `src/policies/schema.ts`. Each ruleset is an ordered list of rules; the first matching rule wins. A rule specifies a Jira project key, an optional JQL condition, and a Bekk timecode ID. Matching is delegated to Jira's `/jql/match` API. When Jira projects add new components or epics, edit `policies.json`.

### Ruleset editor (`src/policy/`, routes `/policy/*`)

Employees draft rulesets, save them as local rulesets in the browser, and export the JSON for the admin. Before working on `/policy/*`, `src/policies/draft*`, `catalog.ts` or `useAllTimecodes`, read `docs/policy-editor.md`.

### Reconciliation (`src/reconciliation/`)

Pure domain logic, kept free of API clients so it can be tested with plain functions (tests live in `tests/reconciliation/`).

- `entities.ts` — `JiraWorklog`, `BekkEntry`, `BekkTimecodeId`, `DayReport`, `ManagedTimecodeDayComparison`. A `DayReport` has per-timecode `comparisons` (Jira vs Bekk hours), plus `unmanagedEntries` (Bekk entries on timecodes the policy doesn't manage — never touched) and `unmatchedJiraWorklogs` (Jira worklogs no rule matches — a day with any of these is not in sync). `LockDate` is `unknown` (loading or failed, locks every day), `none` (never locked) or a `date`.
- `contracts.ts` — `Policy` (`matchIssues`, `selectManaged`) and the loader function types injected into reconciliation.
- `reconcile.ts` — `reconcilePeriod` loads Jira worklogs, matches issues via the policy, loads Bekk entries, and builds `DayReport[]`. It throws on invariant failures (policy missed an issue, or matched a timecode it doesn't manage).
- `implementation/jqlPolicy.ts` — the `Policy` implementation backed by a `Ruleset`.
- `syncPreview.ts` — `planSync` turns reports into `ProposedChange[]` (date, timecode, current → target hours). Jira hours are the source of truth; only managed timecodes with differing hours on unlocked days produce changes (ADR 0001).
- `syncWeek.ts` — applies changes sequentially via an injected `write`; on failure it throws with how many entries were already updated.
- `useWeeklyReconciliation.ts` — React Query glue: `useWeeklyReconciliation(week, ruleset)` query and `useSyncWeek()` mutation (invalidates the `["reconciliation"]` queries). The concrete loaders/writers are in `src/data/` (`jira/loadJiraWorklogs`, `loadBekkEntries`, `writeBekkHours`).

### Authentication

The login flows, token handling and function paths are in `docs/authentication.md`. Read it before working on `src/login/` or `src/backend/`.

- **Jira**: OAuth 2.0 tokens stored in `sessionStorage`; refresh handled by Netlify serverless function `src/backend/jira-auth-session.ts` using httpOnly cookie refresh tokens
- **Bekk**: Azure Entra ID via `@azure/msal-react`, managed in `src/login/bekk/`. `useBekkAccount()` reads the Bekk user.

### API clients

Both APIs use the same stack: `openapi-typescript` for type generation and `openapi-fetch` for the HTTP client.

- **Jira**: `src/data/jira/jiraclient.ts` — module-level singleton; types in `src/generated/jira-issues.d.ts` (from `pnpm generate:jira`)
- **Bekk**: `src/data/bekkclient.ts` — module-level singleton; types in `src/generated/bekk-timekeeper.d.ts` (from `pnpm generate:bekk`)

Auth is injected via middleware on each client. Jira uses a sessionStorage-backed token context (`src/login/jira/authContext.ts`; a 401 from Jira invalidates the token, refreshes it and retries the request once, see `jiraclient.ts`); Bekk calls `msalInstance.acquireTokenSilent()` directly (the MSAL `PublicClientApplication` instance is a module-level singleton exported from `src/login/bekk/bekkLogin.tsx`).

`getEmployeeId()` in `src/login/bekk/bekkLogin.tsx` reads the employee ID from the active MSAL account — call it inside `queryFn`, not at the hook level.

### Key patterns

Coding rules live in `CODING_STANDARDS.md`, which review checks against.

- **Branded types**: `src/Utils/brandedTypes.ts`. **Dates and ISO weeks**: `src/date-time/IsoWeek.ts`. **Shared helpers**: `src/Utils/`.
- **Styling**: Digdir Designsystemet, default theme, light mode only (`data-color-scheme="light"` is hardcoded in `index.html`). Global base styles live in `src/global.css`. Layout primitives are in `src/layout/` (`Page`, `Row`, `Column`).
- **Tests**: vitest, no jsdom or testing-library.

### Fake backend (`src/fake/`, local dev only)

`VITE_FAKE_BACKEND=true pnpm start` runs the app against fake data, with no logins or `.env`. Before working on `src/fake/`, `/__fake`, the auth seams (`bekkLogin.tsx`, `authPaths.ts`) or taking screenshots (`pnpm screenshot`), read `docs/fake-backend.md`.

### Serverless functions (`src/backend/`)

Netlify functions handle the Jira OAuth flow (init → callback → session refresh → logout). They run server-side to keep `JIRA_CLIENT_SECRET` out of the browser.

## Environment variables

| Variable                                | Purpose                                                      |
| --------------------------------------- | ------------------------------------------------------------ |
| `VITE_BEKK_BASE_URL`                    | Bekk API endpoint                                            |
| `VITE_BEKK_ENTRA_*`                     | Azure Entra ID config for MSAL                               |
| `VITE_ATLASSIAN_CLOUD_ID`               | Jira cloud tenant ID                                         |
| `JIRA_CLIENT_ID` / `JIRA_CLIENT_SECRET` | Jira OAuth credentials (server-side only)                    |
| `VITE_DEBUG`                            | Enables dev tools overlay                                    |
| `VITE_FAKE_BACKEND`                     | `true` runs `pnpm start` against the fake backend (dev only) |
| `OVERRIDE_DEPLOY_URL`                   | OAuth redirect base URL, `http://localhost:5173` locally     |

## Agent skills

### Issues and pull requests

Issues live in GitHub Issues for sondremb/JiraSync, used through the `gh` CLI. Before starting an issue or opening a PR, read `docs/agents/issue-tracker.md`. Issues are worked in git worktrees (workmux, or plain git): see `docs/agents/worktrees.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`. `docs/how-employees-log-hours.md` explains how employees log and lock hours, which sets the domain's deadlines.
