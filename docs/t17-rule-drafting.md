# T17 Rule drafting: plan, status and next steps

Source spec: `spec.md` (repo root). This document records the decisions, research, what is built, and what remains, so the work can be resumed later.

## Goal

Digdir-only pages (no Lisa) for viewing, drafting and exporting mapping rulesets (`src/policies/policies.json`). Users can't change rulesets live: they draft, then download or copy JSON to send to an admin, who adds it to `policies.json`.

## Decisions (made with the user)

- Pages require Bekk and Jira login, using the same guard as `/`.
- Build minimal Digdir `Page`/`Row`/`Column` as part of this task (migration step 2 in `docs/digdir-migration.md`). Pages render inside the existing Lisa root until step 6 of that doc.
- Export = a single ruleset JSON, validated against the zod schema, in the same key order and tab-indented layout as `policies.json`.
- Drafts persist in localStorage (`jirasync.drafts`). Only valid, explicitly saved drafts are persisted. Half-finished edits live in page state.
- **Part B (in scope):** a user can select a draft in the sync view.
- Ruleset ids are immutable on edit (ids are stored in `localStorage["selectedRulesetId"]`). "Save as copy" branches. Reserved id: `new`.
- A draft with the same id as a bundled ruleset is an "edited copy" that overrides it locally, and is marked as such.
- JQL validation is advisory only and checks syntax only (see research).

## Research findings

- **Timecodes:** `GET /v3/timecodes?Fields=id,code,name,active` returns all 7501 timecodes (~602 kB, uncompressed). There is no search or paging; only `ProjectId`, `Fields` and `Ids`. Load them lazily, only on the edit page, cache with `staleTime: Infinity`, and filter client-side. `useBekkTimecodes` (timecodeaccesses) is the wrong source because it only covers the user's own timecodes.
- **Digdir 1.23.0:**
  - `Combobox` has a custom `filter(input, option)` and opt-in `virtual` (tanstack-virtual), and no free-text entry. Its default filter is `startsWith`, so pass a substring filter over the "code name" label. `portal` defaults to true. Hide inactive timecodes unless the rule already uses one.
  - `Suggestion` (experimental) supports `creatable`, but is not virtualized.
  - So the timecode picker is `Combobox` + `virtual`. The project field must allow free text, so it is a `Textfield` plus suggestions, not a Combobox.
  - Digdir CSS lives in `@layer`; Lisa's `GlobalStyle` is unlayered but only a mild reset, so coexistence works. Verified visually by the user for the list and detail pages.
- **Jira projects:** `/project/search` returns the user's accessible projects (11 for the user). Jira can't tell "doesn't exist" from "no access": `/project/{key}/components` returns 404 for both. Names fall back to the raw key; component suggestions are silently empty.
- **JQL:** `/jql/parse` with default `strict` validation rejects projects the user can't see. `validation=none` checks syntax only and accepts unknown projects (confirmed by the user in Bruno). The UI should say "syntax OK / syntax error", never "valid", and never block saving or export.
- Existing rules use component ids (`component = 10121`), which are opaque to humans, so the editor should offer a component helper (reads `/project/{key}/components`, inserts `component = <id>`) and show the effective JQL `project = 'KEY' AND (…)`.
- The reconciliation query key already includes `ruleset.rules` (`useWeeklyReconciliation.ts`), so edited drafts refetch correctly. The remount key in `App.tsx` (`${week}-${id}`) uses only the id.
- The repo has no jsdom/testing-library, so tests are logic-only. Keep logic in pure modules.

## Status

### Done

- `netlify.toml`: SPA fallback redirect (`/* -> /index.html 200`). Verified on a Netlify deploy preview.
- `comment` now carries through `loadPolicies`/`Rule` (`src/policies/schema.ts`, `src/rules.ts`), and `ruleSchema`/`rulesetSchema` are exported.
- **Domain** (pure, tested in `tests/policies/`):
  - `src/policies/draft.ts`: `DraftRuleset`/`DraftRule`, edit functions (`updateMeta`, `updateRule`, `insertRule`, `deleteRule`, `moveRule`), `validateDraft` (returns error codes, not text; takes the set of taken ids), `toRuleset`, `exportRuleset`.
  - `src/policies/draftStore.ts`: `loadDrafts`/`saveDraft`/`deleteDraft` (tolerant of corrupt or blocked storage) and `getDraftStorage()`.
  - `src/policies/catalog.ts`: `buildCatalog`/`findEntry` (bundled + drafts, selected first, kinds `bundled | draft | edited`).
  - `src/policies/useDrafts.ts`: `useDrafts`/`useSaveDraft`/`useDeleteDraft`, the single React Query source for drafts (`["policies", "drafts"]`).
  - `src/policies/usePolicyCatalog.ts`: React hook over `useRuleSet` and `useDrafts`.
  - `src/policies/timecodeOptions.ts`: `timecodeLabel`, `matchesTimecode` (Combobox filter), `isOfferedTimecode`.
  - `src/policies/draftMessages.ts`: Norwegian text for every `validateDraft` error code.
- **Data layer** (loaders tested with mocked clients in `tests/data/`):
  - `src/data/loadTimecodes.ts` (`loadAllTimecodes`, `loadTimecodesByIds`, chunks of 100), `src/data/jira/loadProjects.ts`, `loadProjectComponents.ts`, `validateJqlSyntax.ts`.
  - Hooks: `useAllTimecodes`, `useTimecodesByIds`, `useJiraProjects`, `useProjectComponents`, `useJqlSyntax` (debounced 500 ms). Only `useJiraProjects` and `useTimecodesByIds` are used so far; the rest wait for the editor.
- **Shell:** `src/layout/{Page,Row,Column,UserStatus}` (CSS modules, BEM), `src/login/requireAuth.ts` and `useLogout.ts` (also used by `routes/index.tsx` and the Lisa `LoginStatus`).
- **Pages (verified by the user):** `/policy/all` (`src/policy/PolicyList.tsx`) and `/policy/$id` (`src/policy/PolicyDetail.tsx`), via `src/routes/policy.all.tsx` and `policy.$id.tsx`, wrapped by `src/policy/PolicyPage.tsx`.
- **Routes:** `/policy/$id/edit` and `/policy/new` (`?from=<id>` copies a ruleset). Links: "Nytt regelsett" on the list, "Rediger" and "Lag kopi" on the detail page.
- **Editor (Part A, structure verified by the user; compact list not yet):** `src/policy/PolicyEditor.tsx` (page, save/export, delete dialog, which rule is open), `RuleList.tsx` (sortable list with `@dnd-kit`, "+" insert buttons between rules), `RuleRow.tsx` (a closed rule as one read-only line with a drag handle, edit and delete), `RuleEditor.tsx` (the open rule: project with a datalist of Jira projects, JQL with a component helper, effective JQL and syntax feedback, comment), and `TimecodePicker.tsx` (virtual `Combobox`). Pure helpers live in `src/policies/editorState.ts` (`initialDraft`, `takenIds`, `exportFileName`, `addComponentClause`, `effectiveJql`, `firstInvalidRule`). `useJqlSyntax` also uses `effectiveJql`.
  - One rule is open at a time. New rules open automatically, and a failed save or export opens the first invalid rule.
  - Reordering is drag and drop via `@dnd-kit` (decided with the user, replacing the earlier "no drag and drop"), with keyboard dragging and Norwegian screen reader announcements.
  - Errors show only after a save or export attempt. Save, download and copy are always clickable and reveal the errors when the draft is invalid.
  - "Lagre som kopi" links to `/policy/new?from=<id>`, so unsaved edits are not carried over.
  - Deleting an "edited" copy goes back to the bundled ruleset; deleting a draft goes to the list.

- **Part B (use a draft in the sync view):** `useRuleSet` (`src/data/useRuleset.ts`) now merges bundled rulesets with drafts from `useDrafts`. The selection is stored as an id (`localStorage["selectedRulesetId"]`, query key `["rulesets", "selectedId"]`) and resolved by `resolveSelected` in `catalog.ts`, using the same override rule as `buildCatalog`. Deleting an edited copy falls back to the bundled ruleset. Deleting a selected draft-only ruleset leaves nothing selected, so `RulesetWrapper` shows the picker. `RulesetSelector` lists drafts as "(kladd)" and edited copies as "(redigert kopi)", in a stable order. The `App.tsx` remount key uses `rulesetKey`, a hash of the id and rules. `usePolicyCatalog` reads the bundled list from `useRuleSet`.

All of `pnpm build`, `tsc --noEmit`, `pnpm lint` and `pnpm test` pass (244 tests).

### Not done

**Part A:** manual check by the user (review point 2).

**Part B:** manual check by the user.

**Other**

- Update `CLAUDE.md` (new pages, draft store, hooks) and `TODO.md` (T17) when finished.

## Review points agreed with the user

1. After list/detail pages: **done and verified.**
2. After the editor, before Part B: **editor built, awaiting review.**

## Risks and notes

- A draft id may later collide with a newly added bundled id (handled by the "edited copy" rule plus a visible marker).
- Overlap with T21/T22 (removing `RulesetWrapper`/`LockdateWrapper`): keep Part B changes small.
- The full timecode list is ~600 kB: only load it on the editor, never on the list/detail pages.
- `spec.md` is committed along with the T17 work. `bruno/…` files are the user's own edits from the API checks: don't commit them unless asked. `pnpm format` decides formatting for all files, including `spec.md` and the docs.
