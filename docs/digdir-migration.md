# Migrate from Lisa to Digdir design system (Designsystemet)

## Context

JiraSync uses the private Lisa design system (`@utdanningsdirektoratet/lisa`, `lisa-tokens`) from GitHub Packages. `docs/insight.md:52` already states the preference to move to Digdir with the default theme. Moving to the public `@digdir/designsystemet-*` packages also removes the `NPM_TOKEN` and private-registry setup (`.npmrc`, `.github/workflows/tests.yaml`, README.md:86).

About 17 source files import Lisa. There is no UI test coverage: tests are logic-only, so the tests can't catch UI regressions and verification has to be manual.

## Approach

Migrate in small, separately verifiable steps. Lisa and Digdir can coexist briefly, so each step keeps the app working.

### 1. Foundation ✅ Done

- Add `@digdir/designsystemet-react`, `@digdir/designsystemet-css` and an icon package (`@navikt/aksel-icons`). Use `pnpm`. `@digdir/designsystemet-theme` is deprecated; the default theme ships in the CSS package as `@digdir/designsystemet-css/theme.css`.
- Import the CSS and theme once in the entry point (`index.tsx`). Set `data-color-scheme` and `data-size` on `#root` in `index.html`. (Done.)
- Keep `LisaProvider`, `GlobalStyle` and the Roboto font untouched until the final step (step 6), because the remaining Lisa components depend on them. Lisa and Digdir run side by side until then. Scope Digdir styling to the migrated components so the two don't clash.

### 2. Replace layout primitives and utility classes

- No Digdir equivalent of `PageLayout`, `FlexRow` or `FlexColumn`. Add small local components (`Row`, `Column`, `Page`) with CSS and Digdir spacing tokens, or use Digdir's `Stack`/layout helpers if the installed version has them.
- Replace the ~12 Lisa utility classes (`mt-20`, `mx-40`, ...) with CSS. Fix the `clasName` typo in `WeeklyReconciliation.tsx:167`.
- Replace `useScreenSize`/`ScreenSize` (`routes/login.tsx`) with a media query.

### 3. Replace simple components (mechanical)

- `H1`/`H2`/`Text`/`P` → Digdir `Heading`/`Paragraph`. Map `textStyle` values to `data-size`.
- `Button` → Digdir `Button`. Handle `pending` (loading state), `icon`/`iconPlacement`, `variant="text"` → `tertiary`, `outlined` → `secondary`, and `url` → `asChild` with `<a>` or Digdir `Link`.
- `Link`, `Alert` (`data-color`), `RadioGroup` → `Fieldset` + `Radio`.
- `Icon`/`Pictogram` → Aksel icons (arrows, lock/unlock, eye, user).

### 4. Rework the components that need real design

- **`Modal`/`ConfirmModal`** (`RulesetModal.tsx`, `WeeklyReconciliation.tsx`) → Digdir `Dialog`. Build the confirm/cancel footer by hand, with a small `ConfirmDialog` wrapper that keeps the existing props.
- **`useNotification`** → Digdir has no toast. Decide: inline `Alert` or a small custom toast.
- **`TimeTable`** (biggest risk) → Digdir `Table`, which is a plain semantic table. Rebuild `headerColor`, per-row `rowColor`, and the pending skeleton rows (use Digdir `Skeleton`). `gridModel.ts` is pure and unaffected.
- **`timetable-cell.tsx`** → heaviest custom styling. Re-express colors, `spacing()`, `rem()` and `borderRadius` with Digdir CSS variables.
- **Week navigation bar** (`App.tsx:47-80`) → custom, built on Digdir `Button`s. No week picker exists in Digdir.

### 5. Styling: CSS modules with BEM naming (decided)

- Replace `styled-components` with CSS modules (`*.module.css`) with BEM-based class names (`block__element--modifier`), e.g. `.timetableCell__label--bold`. Use Digdir CSS variables for tokens.
- Do this per component as it is migrated in steps 2–4, instead of a separate pass, so each file is touched once.
- Once no `styled` usage remains, remove `styled-components`, `@types/styled-components`, `src/typings/styled-components-compat.d.ts` and the `@ts-expect-error` in `src/components/P.tsx`.

### 6. Final step: remove Lisa

Only once nothing imports `@utdanningsdirektoratet/*` any more (check with grep):

- Remove `LisaProvider` and `GlobalStyle` from `src/routes/__root.tsx` / `src/global-style.ts`. Keep the CSS reset and move the `stålblå200` background to a Digdir token.
- Fonts: switch from Roboto to Digdir's default font (Inter) only now. Remove the Google Fonts link in `index.html` and the hard-coded Roboto in `timetable-cell.tsx`. Check visually first.
- Remove the `@utdanningsdirektoratet/*` deps, `.npmrc` registry/token, CI registry settings and `NPM_TOKEN` docs (README.md:86).
- Update the `manualChunks` rule in `vite.config.ts` (`@utdanningsdirektoratet` → `@digdir`).
- Update `CLAUDE.md`, `README.md` and `TODO.md` with the new design system.

## Suggested order

1 → 2 → 3 (file by file, starting with `login.tsx`, `routes/*` and small components) → 4 (Dialog, then Table) → 5 (alongside 2–4) → 6 (last). One commit per step.

## Verification

- `pnpm build`, `pnpm lint`, `pnpm format:check` and `pnpm test` pass after each step.
- Run the app (`pnpm start`) and check manually: login, week navigation, timetable, sync preview, lock/unlock, ruleset modal, confirm dialog, notifications, privacy and logout pages. Compare against the current UI.
- Check that no `@utdanningsdirektoratet` import remains: `grep -r utdanningsdirektoratet src`.
- Consider adding a minimal render test for `TimeTable` before step 4, since there is no UI coverage today.

## Open decisions

- Toast replacement (inline `Alert` vs custom toast).
