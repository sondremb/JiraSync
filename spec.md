# T17 Rule drafting

A new page for "drafting" rulesets.
Made entirely using DigDir design system, NO Lisa.

- /policy/all
  - lists all policies with name, description
  - if user has selected a policy for themselves, put it at the top of the list, marked "dine regler"
  - a link to view/edit each policy
- /policy/:id
  - view policy details, including all rules
  - rule timecode is shown as code + name, same as in TimecodeLabel.tsx
  - project is shown as full name if possible
    - what can we show if user does not have access to a project? Do we know if it exists?
- editing - a separate page (/policy/:id/edit), or just
  - make users aware that edits aren't live, and have to be sent to the admin to be added
  - can edit a rule (project, timecode or JQL)
  - can delete a rule
  - can add a new rule at any position in the policy (which is an ordered list)
  - timecodes
    - dropdown/selectable, shown as code + name
    - should be able to type to search
    - there are ~2000 timecodes in total in production, how do we avoid perf issues?
  - project should autocomplete if possible
    - but we have to support that users add or edit rules for projects they don't have access to, so we'll have to trust their input
    - there are a limited number of projects, and user have access to an even more limited number (always <5)
  - JQL - just an input field?
    - what options exist?
    - again, we have to support the fact that users may edit rules for things (tickets, components etc.) they don't have access to in Jira
  - buttons for download as JSON or copy to clipboard, for sharing
- create a new policy
  - same UI as editing
  - check that ID is unique
