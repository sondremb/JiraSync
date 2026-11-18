# JiraSync

Keeps an employee's Bekk timesheet consistent with the hours they log in Udir's Jira. Jira is the source of truth, and a policy decides which Bekk timecode each Jira worklog belongs to.

## Language

### The two sides

**Jira worklog**:
Hours an employee logged on one Jira issue on one day.
_Avoid_: Jira work, Jira hours

**Bekk timecode**:
A code in Bekk Timekeeper that employees register hours against, such as a customer project's "Nyutvikling" or "Forvaltning".
_Avoid_: Internal timecode, Bekk ID

**Bekk entry**:
Hours an employee registered on one Bekk timecode on one day.
_Avoid_: Internal work, internal hours, timesheet row

**Lock date** _(UI: låsedato)_:
The last day whose Bekk entries the employee has finalised. Bekk entries on or before the lock date are immutable. A lock date can only be a Sunday or the last day of a month.
_Avoid_: Locked week, submission date

### Mapping

**Policy**:
The rules that decide which Bekk timecode a Jira worklog belongs to, and which Bekk timecodes Jira owns.
_Avoid_: Mapping, config

**Selected policy**:
The policy the employee has chosen to reconcile with. The employee is choosing a Jira-to-Bekk mapping, so its form (such as a ruleset) doesn't matter to them.
_Avoid_: Selected ruleset, active rules

**Ruleset**:
The current kind of policy: an ordered list of rules, each pairing a Jira project and an optional JQL condition with a Bekk timecode. The first matching rule wins.
_Avoid_: Policy file, rule list

**Managed timecode**:
A Bekk timecode whose hours Jira owns under the selected policy. Its Bekk entries should always equal the matched Jira worklogs. The policy decides which timecodes it manages: these must include every timecode it matches worklogs to, and may include others, such as timecodes retired by a contract change.
_Avoid_: Synced timecode, mapped timecode

**Unmanaged entry**:
A Bekk entry on a timecode that the selected policy does not manage. JiraSync never touches it.
_Avoid_: Unmanaged internal, manual hours

**Unmatched Jira worklog**:
A Jira worklog that no part of the selected policy matches. It always means the policy has a gap, and syncing cannot fix it. A policy cannot ignore worklogs, because every Jira hour is invoiced to the customer and so must also appear in Bekk.
_Avoid_: Unmapped work, orphan worklog

### Reconciliation

**Day report**:
One day's comparison of Bekk entries against Jira worklogs, split into managed timecodes (Bekk hours vs matched Jira hours), unmanaged entries and unmatched Jira worklogs. The day is the unit of reconciliation, even though employees usually reconcile a week at a time because the lock date moves weekly.
_Avoid_: Daily diff, day status

**In sync**:
A day is in sync when every managed timecode's Bekk entry equals its matched Jira hours and the day has no unmatched Jira worklogs. A locked day can be out of sync with no way to fix it.
_Avoid_: Reconciled, up to date

**Proposed change**:
A planned overwrite of one Bekk entry (one day, one managed timecode) from its current hours to the matched Jira hours. A change is never proposed on or before the lock date, and none at all when the lock date is unknown.
_Avoid_: Sync preview, diff, update

**Sync**:
Applying proposed changes, which overwrites Bekk entries on managed timecodes with the matched Jira hours. It only goes one way, from Jira to Bekk.
_Avoid_: Push, export, two-way sync

### Application

**Bundled ruleset**:
A ruleset that ships with JiraSync and is available to every employee.
_Avoid_: Default ruleset, official policy

**Local ruleset**:
A ruleset saved in the employee's browser. It overrides the bundled ruleset with the same id, if there is one.
_Avoid_: Draft, edited ruleset, custom policy

**Draft**:
The unfinished, possibly invalid form of a ruleset while it is being edited, before it is saved as a local ruleset.
_Avoid_: Unsaved ruleset, local ruleset
