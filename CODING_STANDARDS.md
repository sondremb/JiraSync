# Coding standards

Rules that take judgement to apply. Review checks every change against each one. Rules a linter can check live in `pnpm lint` (`.oxlintrc.json`), not here.

## Logic

- **Decisions live in pure modules.** Logic that decides state (what a day's status is, whether a sync is allowed, which message to show) goes in a plain TypeScript module with tests, and the component renders the result. There is no jsdom or testing-library, so logic left inline in a component is untested. Examples: `planSync` in `src/reconciliation/syncPreview.ts`, `cellState` in `src/components/TimeTable/gridModel.ts`. A nested ternary choosing between states inside JSX belongs in such a module.
- **One mapping per shared status set.** When several components show the same set of statuses (`CellState`, `DayStatus`), one module maps each status to its label, icon and colour, and every component reads from it. Each component that switches on the status itself is a copy that drifts.
- **One helper per repeated small shape.** Plurals, class-name joining and string clean-ups each have one shared helper, which the second use extracts. Class names join with `classNames` from `src/Utils/classNames.ts`.

## Types

- **Branded types for keys and dates.** Jira issue keys, ISO dates, ISO weeks and access tokens are typed `JiraIssueKey`, `IsoDate`, `IsoWeek` and `AccessToken` (`src/Utils/brandedTypes.ts`), branded where the value enters the app, so a plain `string` never stands in for one.
- **Dates in Norway time.** Date and week handling goes through `src/date-time/IsoWeek.ts`, which works in the Norway timezone. Weeks are formatted `YYYY-Www`.

## React and data

- **Server state in React Query.** Jira and Bekk calls go through `@tanstack/react-query`: `useQuery` for fetches, and `useMutation` plus `invalidateQueries` for writes.
- **The Bekk user comes from `useBekkAccount()`**, which works against both MSAL and the fake backend. `useMsal()` stays inside `src/login/bekk/`.

## Styling

- **Designsystemet first.** UI is built from `@digdir/designsystemet-react` components, with icons from `@navikt/aksel-icons`. Custom styles go in a CSS module next to the component.
- **BEM class names** in CSS modules: `block__element--modifier`.
- **Design tokens for colour and size.** Colours, spacing, font sizes, radii and borders use `--ds-*` tokens. Where no token fits, sizes are in `rem` or `em`. A CSS module has no hex colours, `rgb()`/`rgba()` or `px` values. oxlint doesn't read CSS, so review is the only check (#48 decides on stylelint).
