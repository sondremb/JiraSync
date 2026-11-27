# JiraSync

JiraSync keeps an employee's Bekk timesheet in line with the hours they log in Jira. It loads Jira worklogs and Bekk entries for a week, uses a policy to work out which Bekk timecode each Jira worklog belongs to, shows the days that are out of sync, and writes the Jira hours into Bekk Timekeeper.

The domain terms (policy, ruleset, managed timecode, in sync, lock date and so on) are defined in [GLOSSARY.md](GLOSSARY.md).

## Prerequisites

- Node.js, the version in [.nvmrc](.nvmrc)
- pnpm (`corepack enable` picks the version in `package.json`)
- Access to Udir's Jira (Atlassian) and to Bekk Timekeeper, for running against the real systems

## Getting started

To try the app without logins or configuration, run it against the fake backend, which serves made-up data from memory:

```bash
pnpm install
VITE_FAKE_BACKEND=true pnpm start
```

To run against the real Jira and Bekk, set up a `.env` first (see [Configuration](#configuration)) and run:

```bash
pnpm start
```

Real logins only work on `http://localhost:5173`, because the Jira and Entra redirect URIs are registered for that address.

## Scripts

| Script                                 | Description                                                               |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm start`                           | Start the Vite dev server                                                 |
| `VITE_FAKE_BACKEND=true pnpm start`    | Start the dev server against the fake backend                             |
| `pnpm build`                           | Type-check and build for production, then check no fake code is in `dist` |
| `pnpm test`                            | Run the tests (Vitest)                                                    |
| `pnpm lint`                            | Lint with oxlint                                                          |
| `pnpm typecheck`                       | Type-check with tsc                                                       |
| `pnpm format`                          | Format with oxfmt (`pnpm format:check` only checks)                       |
| `pnpm generate`                        | Regenerate the Jira and Bekk API types from their OpenAPI schemas         |
| `pnpm generate:bekk`                   | Regenerate the Bekk types only                                            |
| `pnpm generate:jira`                   | Regenerate the Jira types only                                            |
| `pnpm screenshot <product URL> <file>` | Screenshot a page against the fake backend                                |

The generated API types are committed, so a fresh checkout builds without `pnpm generate`.

## Architecture

- The browser logs in to Jira and Bekk and calls both APIs directly with the employee's own access. See [docs/authentication.md](docs/authentication.md).
- A small set of Netlify functions (`src/backend/`) runs the Jira OAuth flow, so the client secret stays on the server.
- The selected policy matches Jira issues to Bekk timecodes. Matching is done by Jira's JQL API.
- Reconciliation compares the matched Jira hours with the Bekk entries day by day and proposes changes. Syncing writes them to Bekk.
- Employees can draft their own rulesets in the browser and export them for review.

### Main parts

- **`src/reconciliation/`**: the domain logic: comparing Jira and Bekk per day, and planning and applying a sync. Pure functions with tests.
- **`src/policies/`**: the bundled rulesets (`policies.json`), their schema and the drafting logic.
- **`src/policy/`**: the ruleset editor pages (`/policy/*`).
- **`src/components/`**: the weekly view, with the grid, sync preview and locking.
- **`src/data/`**: the Jira and Bekk API clients and loaders.
- **`src/login/`**: Jira and Bekk login.
- **`src/backend/`**: the Netlify functions for Jira OAuth.
- **`src/fake/`**: the fake backend, for local development only.

Decisions and the reasons behind them are recorded in [docs/adr/](docs/adr/).

### Technology

- **Vite**: bundler and dev server
- **TanStack React Query**: server state for all API calls
- **TanStack Router**: file-based routing with code splitting
- **openapi-typescript + openapi-fetch**: typed API clients generated from OpenAPI schemas
- **Designsystemet** (Digdir, default theme) and CSS modules with BEM class names: styling
- **MSAL React**: Bekk login (Azure Entra ID)

## Configuration

The app reads its configuration from environment variables. For local development, copy [.env.example](.env.example) to `.env` and fill in the missing values.

| Variable                    | Description                                                    | Used by |
| --------------------------- | -------------------------------------------------------------- | ------- |
| `VITE_BEKK_BASE_URL`        | Bekk Timekeeper API URL                                        | Browser |
| `VITE_BEKK_ENTRA_TENANT_ID` | Azure Entra tenant ID                                          | Browser |
| `VITE_BEKK_ENTRA_CLIENT_ID` | Azure Entra client ID                                          | Browser |
| `VITE_BEKK_ENTRA_SCOPE`     | Azure Entra scope for the Bekk API                             | Browser |
| `VITE_ATLASSIAN_CLOUD_ID`   | Jira Cloud ID                                                  | Browser |
| `VITE_DEBUG`                | `true` shows the dev tools overlay                             | Browser |
| `VITE_FAKE_BACKEND`         | `true` runs `pnpm start` against the fake backend (dev only)   | Browser |
| `JIRA_CLIENT_ID`            | Jira OAuth client ID                                           | Server  |
| `JIRA_CLIENT_SECRET`        | Jira OAuth client secret                                       | Server  |
| `OVERRIDE_DEPLOY_URL`       | Base URL for the OAuth redirect, e.g. `http://localhost:5173`. | Server  |

Server variables are read only by the Netlify functions and never reach the browser. Without `OVERRIDE_DEPLOY_URL`, the functions use the URL Netlify gives the deploy.

## Deploy

Netlify deploys the app automatically. `netlify.toml` sets the build command, the publish folder (`dist/`), the functions folder (`src/backend/`) and the fallback that serves `index.html` for deep links.

GitHub Actions runs the tests, lint, typecheck, format check and build on every pull request.
