# JiraSync Rewrite — Draft Design

**Status:** Proposal for discussion. This summarizes the direction so far; choices marked **Open** are not implementation decisions.

## 1. Purpose and scope

JiraSync helps a signed-in employee reconcile **their own** Jira worklogs with hours recorded in an Internal System. It shows discrepancies, explains how Jira issues map to timecodes, and helps the employee update unlocked Internal System hours.

The first rewrite does not model manager–employee relationships, provide manager views, or retain a history of individual worklogs. Syncing **to Jira** and arbitrary Internal System time entry are potential later capabilities. A rule-drafting tool is a nice-to-have, second-order priority; read-only, developer-maintained policies come first.

Jira and the Internal System remain authoritative for their respective worklogs, time entries, access rights, and locking permissions.

Rewrite goals:
* Increase testability and test coverage
* Increase maintability and ease of understanding
* Decouple from Udir
* Increase portability and decouple from Netlify hosting
* Better support multiple user flows
* Reduce friction in policy updates

To achieve the goal:
* A testable domain core, Clean Architecture (CA) inspired
* Move policies to data (static JSON for now), but abstracted so they may become live data later
* Rewrite to DigDir design system (with default theme for now)
* An overall strategy for handling errors


## 2. Domain behavior

- A **mapping policy** is an ordered list of rules. Each rule specifies a Jira project, an optional JQL condition, and an Internal System timecode. The first matching rule wins.
- Matching is delegated to Jira. This keeps Jira-specific field semantics—including custom fields—out of JiraSync's matching engine. Rule *configuration* can still be specific to a Jira site.
- For an employee, date, and managed timecode, hours are **in sync** when the sum of their Jira worklogs on mapped issues equals their Internal System hours. A period needs review if any applicable day and timecode differs **or if any Jira worklog matches no rule**.
- Internal hours on timecodes outside the selected policy are shown explicitly but do not affect its sync status. Jira worklogs that match no rule are shown explicitly and require review.
- For the initial Jira-to-Internal sync operation, Jira hours are the proposed target. A preview shows the affected dates, timecodes, and changes before writing. The Internal System decides whether a write is permitted, including on locked dates.

**Open:** The domain document currently calls a rule list a *Contract*. Confirm whether that means an actual business contract, or whether *mapping policy/ruleset* is the clearer name. Effective-dated reassignment and the treatment of historical rule changes also need explicit rules before implementation.

## 3. Boundaries

There are two principal domain areas:

- **Mapping Configuration** owns policies, rule order, configuration validation and versions. If added later, it also owns effective-dated policy assignments.
- **Reconciliation** owns daily comparisons, unmatched-work outcomes, discrepancies, and proposed synchronization changes.

**Identity & Access** is a supporting concern: establish the employee's identities in Jira and the Internal System, and authorize actions concerning that employee. It does not include an organizational hierarchy.

Lock state comes from the Internal System. JiraSync may present and initiate locking, but should not duplicate the Internal System's permission or validation rules as if they were authoritative.

These boundaries do **not** prescribe separate services or one screen per context.

## 4. Frontend composition

The primary UI capability is **Review my week**. Its table brings together raw hours, mapping outcomes, sync status, proposed changes, and locking controls. The screen owns the *presentation and coordination* of those concerns; it does not own all their business rules.

```text
Jira worklogs ────────┐
Mapping policy ───────┼─→ reconciliation results ─→ weekly view model ─→ table
Internal entries ─────┤
Lock state ────────────┘
```

Pure domain functions should express comparison and sync-planning rules. Application-level operations coordinate fetching, matching, previewing, and writing. React components and hooks adapt those operations for the screen; API clients adapt the external systems. Create these layers where they clarify real logic, rather than requiring every feature to have an identical folder structure.

The reconciliation domain uses application-owned values, independent of generated API response types. Jira and Internal System adapters validate and translate responses at the data boundary; incomplete or failed fetches must not be treated as empty, in-sync weeks.
The reconciliation operation loads a selected policy, fetches worklogs from both systems, and asks the policy to batch-match distinct worked issue IDs. The policy also supplies its managed timecodes; mapped outcomes must refer to timecodes it manages. A rules/JQL implementation can delegate matching to a Jira adapter while deriving managed timecodes from the same rules. The matching contract requires exactly one explicit mapped or unmatched outcome per worked issue; missing, duplicate, or unexpected outcomes are errors. Daily comparison and sync planning remain pure and synchronous.

**Implementation status:** `src/reconciliation/` contains the contracts, pure daily comparison, asynchronous orchestration, and behavior tests. The operation currently rejects missing match outcomes; validation of unexpected outcomes and key/value ID disagreements is still pending. Production policy and worklog adapters, UI integration, and sync planning have not yet been implemented.

The frontend may initially perform reconciliation using the employee's existing direct access to Jira and the Internal System. Shared configuration publication and authorization, if introduced, belong server-side.

## 5. Configuration and data protection

Move customer-specific rules out of application code into a **versioned, validated data format**. Retain project plus optional JQL rather than introducing a general structured-condition language in the first iteration.

The initial design should avoid a new persistent copy of worklogs, timesheets, Jira tokens, or reconciliation history. Persist only what the selected configuration workflow needs. The progression can be:

1. Versioned policy format and validation.
2. A controlled means of distributing policies.
3. Shared editing or employee assignments only when there is a demonstrated need.

An external file alone does not make rules confidential: rules delivered to a browser are visible to that user. Configuration delivery must reflect who is entitled to see it. Rule **integrity** matters too, because changing a target timecode can cause an incorrect write. Shared changes therefore need authorized publishing, validation, and traceable versions.

**Initial decision:** Employees select their own policy. Start with read-only JSON or static TypeScript policies maintained and published by the developer. Shared editing and employee assignments are not required for the first release.

**Open:** Where may the developer-maintained policies be stored and distributed? The answer must account for the mapping's inclusion of both customer Jira and Internal System identifiers.

**Nice-to-have — rule-drafting tool (second-order priority):** Any signed-in user can start a new policy or copy an existing one into a draft; managers are likely users, but no manager role is required. Using only their existing Jira and Internal System access, they can discover project components and available timecodes by name rather than manually looking up IDs, build ordered rules, and test JQL against issues they can see. Export a **complete proposed policy** in either case, so publication replaces the whole policy rather than applying individual edits. For a copied policy, include its ID and base version to detect changes before publication. The export may include labels for review but must not include tokens or worklogs. Drafting does not publish: the developer reviews and validates the file before replacing or adding a read-only policy. Discovery is limited by the drafting user's existing access.

## 6. Backend and hosting portability

Treat the browser-to-backend **HTTP API and configuration format** as the durable boundary. Use stable `/api/...` routes rather than exposing Netlify function paths to the frontend. Specify requests, responses, errors, authentication, and authorization behavior independently of the host.

Netlify Functions can implement those routes now; a Node server, Next.js backend, or ASP.NET Core service could implement them later. Netlify handlers, server routes, OAuth libraries, and database drivers are replaceable adapters. A move to .NET would preserve the API contract, data formats, domain definitions, and behavior examples—not the TypeScript backend implementation.

Keep server-held OAuth secrets and shared configuration authority on the backend. Keep the SPA and API on one origin where practical to simplify session and cookie behavior.

## 7. Execution strategy

1. **Resolve domain decisions:** terminology, unmatched issues, lock-date boundary, historical policy behavior, and initial policy selection.
2. **Capture behavior examples:** representative weeks covering first-match rules, components/epics, missing fields, multiple issues per timecode, locked dates, and zero-hour changes.
3. **Extract reconciliation decisions:** implement and verify comparison and sync planning independently of React and API responses.
4. **Introduce data-driven policies:** version and validate rules; compare their Jira matches against the current hardcoded rules.
5. **Establish `/api` contracts:** move hosting-specific OAuth routing behind stable URLs; add configuration endpoints only as required by the chosen distribution model.
6. **Build the employee journey:** weekly review, unmatched-work explanation, sync preview, writes, and locking, with mobile support.
7. **Roll out incrementally:** compare results with the existing application on representative real weeks before replacing its workflow.

## Decisions needed next

1. **Policy publication:** where may the developer-maintained Jira/timecode mapping be stored and distributed?
2. **Historical behavior:** which policy applies to past work after a rule changes?
3. **Scope of the first release:** preserve Jira-to-Internal sync only, or include any of the proposed new write workflows?

This proposal sits alongside [insight.md](insight.md), which focuses on domain observations and rules.
