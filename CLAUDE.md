# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start           # Start dev server (Vite)
pnpm build           # Build for production
pnpm test            # Run vitest tests
pnpm lint            # Lint with oxlint
pnpm format          # Format with oxfmt (pnpm format:check to verify)
pnpm generate:bekk   # Regenerate Bekk API types from OpenAPI schema
pnpm generate:jira   # Regenerate Jira API types from OpenAPI schema
pnpm generate        # Calls generate:bekk and generate:jira
```

Always use `pnpm`, not `npm`, `npx`, or `yarn`.

## Architecture

JiraSync is a React/TypeScript SPA deployed on Netlify that synchronizes time tracking between **Jira** and **Bekk Timekeeper**. It fetches data from both systems, maps Jira issues to Bekk timecodes, and lets users push Jira hours into Bekk's weekly timesheet.

### Data flow

1. User authenticates via **Jira OAuth** (Atlassian OIDC) and **Bekk MSAL** (Azure Entra ID)
2. `useWeeklyReconciliation` hook fetches Jira worklogs and Bekk timesheet entries for a given ISO week
3. The selected mapping policy (`src/policies/policies.json`) routes Jira issues → Bekk timecodes via JQL matching
4. `reconcilePeriod` compares the two datasets and produces `DayReport[]`
5. `WeeklyReconciliation` renders the weekly grid, sync preview, and locking controls

### Mapping policy (`src/policies/`)

Rulesets live in `src/policies/policies.json` — a versioned JSON file validated by the zod schema in `src/policies/schema.ts`. Each ruleset is an ordered list of rules; the first matching rule wins. A rule specifies a Jira project key, an optional JQL condition, and a Bekk timecode ID. Matching is delegated to Jira's `/jql/match` API. When Jira projects add new components or epics, edit `policies.json`.

### Reconciliation (`src/reconciliation/`)

Pure domain logic, kept free of API clients so it can be tested with plain functions (tests live in `tests/reconciliation/`).

- `entities.ts` — `JiraWork`, `InternalWork` (Bekk), `DayReport`, `ManagedTimecodeDayComparison`. A `DayReport` has per-timecode `comparisons` (Jira vs Bekk hours), plus `unmanagedInternals` (Bekk hours on timecodes the policy doesn't manage — never touched) and `unmatchedJiraWork` (Jira worklogs no rule matches — a day with any of these is not in sync).
- `contracts.ts` — `Policy` (`matchIssues`, `selectManaged`) and the loader function types injected into reconciliation.
- `reconcile.ts` — `reconcilePeriod` loads Jira worklogs, matches issues via the policy, loads Bekk worklogs, and builds `DayReport[]`. It throws on invariant failures (policy missed an issue, or matched a timecode it doesn't manage).
- `implementation/jqlPolicy.ts` — the `Policy` implementation backed by a `Ruleset` and Jira's `/jql/match` (`matchJiraJqls`).
- `syncPreview.ts` — `planSync` turns reports into `ProposedChange[]` (date, timecode, current → target hours). Jira hours are the source of truth; only managed timecodes with differing hours produce changes.
- `syncWeek.ts` — applies changes sequentially via an injected `write`; on failure it throws with how many entries were already updated.
- `useWeeklyReconciliation.ts` — React Query glue: `useWeeklyReconciliation(week, ruleset)` query and `useSyncWeek()` mutation (invalidates the `["reconciliation"]` queries). The concrete loaders/writers are in `src/data/` (`jira/loadJiraWorklogs`, `loadInternalWorklogs`, `writeInternalHours`).

### Authentication

- **Jira**: OAuth 2.0 tokens stored in `sessionStorage`; refresh handled by Netlify serverless function `src/backend/jira-auth-session.ts` using httpOnly cookie refresh tokens
- **Bekk**: Azure Entra ID via `@azure/msal-react`, managed in `src/login/bekk/`

### API clients

Both APIs use the same stack: `openapi-typescript` for type generation and `openapi-fetch` for the HTTP client.

- **Jira**: `src/data/jira/jiraclient.ts` — module-level singleton; types in `src/generated/jira-issues.d.ts` (from `pnpm generate:jira`)
- **Bekk**: `src/data/bekkclient.ts` — module-level singleton; types in `src/generated/bekk-timekeeper.d.ts` (from `pnpm generate:bekk`)

Auth is injected via middleware on each client. Jira uses a sessionStorage-backed token context (`src/login/jira/authContext.ts`; a 401 from Jira invalidates the token, refreshes it and retries the request once, see `jiraclient.ts`); Bekk calls `msalInstance.acquireTokenSilent()` directly (the MSAL `PublicClientApplication` instance is a module-level singleton exported from `src/login/bekk/bekkLogin.tsx`).

`getEmployeeId()` in `src/login/bekk/bekkLogin.tsx` reads the employee ID from the active MSAL account — call it inside `queryFn`, not at the hook level.

### Key patterns

- **Branded types** (`Utils/brandedTypes.ts`): `JiraIssueKey`, `IsoDate`, `IsoWeek`, `AccessToken` — prevent accidental mixing of string values
- **ISO week** (`src/date-time/IsoWeek.ts`): All date handling uses Norway timezone; format is `YYYY-Www`
- **Server state**: `@tanstack/react-query` for all Jira and Bekk API calls — `useQuery` for fetches, `useMutation` + `invalidateQueries` for writes

### Serverless functions (`src/backend/`)

Netlify functions handle the Jira OAuth flow (init → callback → session refresh → logout). They run server-side to keep `JIRA_CLIENT_SECRET` out of the browser.

## Environment variables

| Variable                                | Purpose                                   |
| --------------------------------------- | ----------------------------------------- |
| `VITE_BEKK_BASE_URL`                    | Bekk API endpoint                         |
| `VITE_BEKK_ENTRA_*`                     | Azure Entra ID config for MSAL            |
| `VITE_ATLASSIAN_CLOUD_ID`               | Jira cloud tenant ID                      |
| `JIRA_CLIENT_ID` / `JIRA_CLIENT_SECRET` | Jira OAuth credentials (server-side only) |
| `VITE_DEBUG`                            | Enables dev tools overlay                 |
