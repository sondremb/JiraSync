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
- **Routes:** `/policy/$id/edit` and `/policy/new` (`?from=<id>` copies a ruleset), both rendering the placeholder `src/policy/PolicyEditor.tsx`. Links: "Nytt regelsett" on the list, "Rediger" and "Lag kopi" on the detail page.

All of `pnpm build`, `tsc --noEmit`, `pnpm lint` and `pnpm test` pass (218 tests).

### Not done

**Part A (rest)**

1. Editor page (replace the placeholder `PolicyEditor`): policy-level fields (name, description; id only on new), and one row per rule:
   - timecode: `Combobox` with `virtual`, a substring filter over "code name", active only unless it's the rule's current value, via `useAllTimecodes`
   - project: `Textfield` with suggestions from `useJiraProjects`
   - JQL: `Textarea`, with a component helper (`useProjectComponents`), a display of the effective JQL, and advisory syntax feedback (`useJqlSyntax`)
   - comment: text field
   - insert above/below, move up/down, delete (no drag and drop), and a "first match wins" hint
2. Banner (`Alert`) that edits aren't live and must be sent to the admin; a note that exported JSON contains customer Jira/Bekk identifiers (warning in `docs/rewrite-design.md`).
3. Save draft (only when `validateDraft` passes), delete draft, "save as copy", via `useSaveDraft`/`useDeleteDraft`; show errors with `draftMessages.ts`; id uniqueness against bundled ids and other drafts.
4. Export: download as `<id>.json` (Blob) and copy to clipboard, both from `exportRuleset(toRuleset(draft))`.

**Part B: use a draft in the sync view**

1. `useRuleSet` (`src/data/useRuleset.ts`) should merge bundled and draft rulesets using the same override rule as `buildCatalog`, keep selection by id in `localStorage["selectedRulesetId"]`, and handle a deleted draft that is still selected. Read drafts from `useDrafts`, the same source as `usePolicyCatalog`, so they can't disagree.
2. `RulesetSelector`/`RulesetModal` (Lisa) list drafts with a label.
3. `App.tsx` remount key includes a hash of the rules.
4. Tests for merge, override and missing-draft handling.

**Other**

- Update `CLAUDE.md` (new pages, draft store, hooks) and `TODO.md` (T17) when finished.

## Review points agreed with the user

1. After list/detail pages: **done and verified.**
2. After the editor, before Part B.

## Risks and notes

- A draft id may later collide with a newly added bundled id (handled by the "edited copy" rule plus a visible marker).
- Overlap with T21/T22 (removing `RulesetWrapper`/`LockdateWrapper`): keep Part B changes small.
- The full timecode list is ~600 kB: only load it on the editor, never on the list/detail pages.
- `spec.md` is committed along with the T17 work. `bruno/…` files are the user's own edits from the API checks: don't commit them unless asked. `pnpm format` decides formatting for all files, including `spec.md` and the docs.
