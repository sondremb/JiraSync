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

### Ruleset editor (`src/policy/`, routes `/policy/*`)

Employees can't change bundled rulesets live. They draft a ruleset, save it as a **local ruleset** in their browser, and export the JSON to send to the admin, who adds it to `policies.json`. Terms follow `GLOSSARY.md` (bundled ruleset, local ruleset, draft).

- **Pages:**
  - `/policy` (`PolicyList`) and `/policy/$id` (`PolicyDetail`)
  - `/policy/$id/edit` and `/policy/new`; `?from=<id>` copies a ruleset (`PolicyEditor`, `RuleList`, `RuleRow`, `RuleEditor`, `TimecodePicker`)
  - All require Bekk and Jira login (`src/login/requireAuth.ts`).
- **Domain logic** (pure, tested in `tests/policies/`):
  - `src/policies/draft.ts`: edit functions, `validateDraft` (returns error codes; the Norwegian text is in `draftMessages.ts`) and `exportRuleset`. The export uses the same key order and tab indentation as `policies.json`.
  - `src/policies/editorState.ts`: editor helpers.
  - `src/policies/catalog.ts`: merges bundled and local rulesets. A local ruleset whose id matches a bundled one overrides it locally and is marked as such.
- **Storage:**
  - Local rulesets: localStorage `jirasync.drafts`, via `draftStore.ts` and `useDrafts.ts`, the single React Query source.
  - Selected ruleset: its id, in `localStorage["selectedRulesetId"]`.
  - `useRuleSet` (`src/data/useRuleset.ts`) resolves the selection across bundled and local rulesets, so a local ruleset can be used in the sync view.
- **Rules:**
  - Ruleset ids are immutable once saved. "Lagre som kopi" makes a new id.
  - `new` is a reserved id.
  - Validation errors appear only after a save or export attempt.
- **Timecodes:** Bekk's `GET /v3/timecodes` has no search or paging and returns all ~7500 timecodes (~600 kB). `useAllTimecodes` loads them only on the editor, cached forever, and filters on the client. Other pages use `useTimecodesByIds`. Don't use `useBekkTimecodes` (timecode accesses) for this: it only covers the employee's own timecodes.
- **JQL:**
  - `useJqlSyntax` checks syntax only (`/jql/parse` with `validation=none`), because strict validation rejects projects the employee can't see.
  - The UI says "syntax OK / syntax error", never "valid", and never blocks saving or export.
  - The editor shows the effective JQL, `project = 'KEY' AND (…)`.
- **Tests:** the repo has no jsdom or testing-library, so keep editor logic in pure modules and test that.

### Reconciliation (`src/reconciliation/`)

Pure domain logic, kept free of API clients so it can be tested with plain functions (tests live in `tests/reconciliation/`).

- `entities.ts` — `JiraWork`, `InternalWork` (Bekk), `DayReport`, `ManagedTimecodeDayComparison`. A `DayReport` has per-timecode `comparisons` (Jira vs Bekk hours), plus `unmanagedInternals` (Bekk hours on timecodes the policy doesn't manage — never touched) and `unmatchedJiraWork` (Jira worklogs no rule matches — a day with any of these is not in sync).
- `contracts.ts` — `Policy` (`matchIssues`, `selectManaged`) and the loader function types injected into reconciliation.
- `reconcile.ts` — `reconcilePeriod` loads Jira worklogs, matches issues via the policy, loads Bekk worklogs, and builds `DayReport[]`. It throws on invariant failures (policy missed an issue, or matched a timecode it doesn't manage).
- `implementation/jqlPolicy.ts` — the `Policy` implementation backed by a `Ruleset`.
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
- **Styling**: Digdir Designsystemet (`@digdir/designsystemet-react`, default theme) with icons from `@navikt/aksel-icons`. Custom styles are CSS modules (`*.module.css`) with BEM class names (`block__element--modifier`) using `--ds-*` tokens. Global base styles live in `src/global.css`. Layout primitives are in `src/layout/` (`Page`, `Row`, `Column`).
- **Announcements** (`src/announcements/`): add `{ id, date, text }` to the list in `announcements.ts` to show a "what's new" banner on `/`. The selection (`unseen.ts`) is pure and tested; dismissal stores a "seen up to" date in `localStorage`.
- **localStorage**: go through `getSafeStorage()` (`src/Utils/safeStorage.ts`), which falls back to a no-op store when storage is blocked.
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

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for sondremb/JiraSync, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
