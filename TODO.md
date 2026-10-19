# TODO

## Doing

## Todo

- [ ] T1 Detailed unmatched-work display
  - Today only a week-level review notice exists. Show unmatched Jira worklogs
    per day (issue key, hours) in the grid.
  - Done when: an unmatched worklog is visible by day and issue, with a test of
    the view model.
- [ ] T3 Don't crash when the user lacks access to a timecode
  - Decide the behavior first: show as an error row, or skip with a notice.
- [ ] T4 Lock date failure shows an error instead of loading forever
  - The weekly timesheet loads with a fallback initial week. Locking controls
    stay disabled until the lock date is known.
- [ ] T5 Behavior examples for representative weeks (design §7.2)
  - First-match rules, components/epics, missing fields, several issues per
    timecode, locked dates, zero-hour changes.
  - Write as tests in `src/reconciliation/`.
- [ ] T6 Policy-vs-old-rules check on real weeks (design §7.4, §7.7)
  - Compare the new JSON policy matches and the old app's results on a few real
    weeks before retiring the old workflow.
- [ ] T7 Stable `/api/...` routes over the Netlify functions (design §6, §7.5)
  - Frontend should not see `/.netlify/functions/*` paths. Document
    request/response/error shapes.
- [ ] T8 Rewrite UI to the digdir design system, default theme
  - Likely needs splitting into smaller tasks once started (layout shell, grid,
    dialogs).
- [ ] T9 Mobile support for the weekly view
  - Do alongside T8, since the grid layout will change anyway.
- [ ] T10 Know when time tracking requires a comment
  - Needs investigation of how the Internal System signals this.
- [ ] T11 Handle overtime when locking the month
  - Needs a domain decision first. What does the Internal System require?
- [ ] T21 Remove lockdate wrapper
- [ ] T22 Remove ruleset wrapper
- [ ] T23 Fix Bekk Swagger generation
- [ ] T24 Write Privacy policy
- [ ] T25 Time since last download
- [ ] T27 Change locking to same as Bekk
  - Only sunday / end of month
- [ ] T28 Add state to URL
  - Isoweek, with "/" defaulting to current logic (week of day after current
    lock date)

## Blocked on a decision

- [ ] T13 Policy distribution without redeploy (design §5, open question 1)
- [ ] T14 Historical policy behavior when a rule changes (open question 2)
- [ ] T15 Terminology: "Contract" vs "mapping policy" across `insight.md` and
      the design doc

## Later / nice-to-have

- [ ] T16 "View without mapping" mode
- [ ] T17 Rule-drafting tool (export a full proposed policy)
- [ ] T18 Log arbitrary Internal hours
- [ ] T19 Sync to Jira
- [ ] T20 Month review

## Done

- [x] T0 Move rulesets from TypeScript to validated JSON (5063cec)
- [x] T12 Remove customer-specific references (as far as practical)
  - Only removed the unused `isUdir` field. Remaining Udir references (bruno
    fixtures, README, `.env.example`, docs, `policies.json` labels) deferred;
    Lisa is covered by T8.
- [x] T26 Improve pending view
  - Swap to Lisa `Table` `pendingProps` while data is loading.
- [x] T2 Don't crash when an issue has no mapping
  - Covered by T1 if the unmatched path is fully handled. Verify with a behavior
    example.
