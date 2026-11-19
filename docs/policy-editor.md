# Ruleset editor (`src/policy/`, routes `/policy/*`)

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
- **Tests:** keep editor logic in pure modules and test that (no jsdom in the repo).
