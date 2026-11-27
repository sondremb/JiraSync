# Rulesets ship with the app

The bundled rulesets are a versioned, schema-validated JSON file (`src/policies/policies.json`) built into the app, and each employee selects the policy they reconcile with. Changing a bundled ruleset takes a code change and a deploy. We chose this over a server-side policy store because a wrong rule writes hours to the wrong Bekk timecode, so every change should be reviewed, and because no one has yet needed to change rules faster than a deploy (#35 covers publishing without one).

Employees can draft rulesets and save them as local rulesets in their own browser, but drafting never publishes: they export the complete ruleset, and the admin reviews it and adds it to `policies.json`. An export replaces a whole ruleset rather than applying edits to one.

## Consequences

- A ruleset is not confidential. Every bundled ruleset, including its Jira project keys and Bekk timecode IDs, is in the JavaScript every user downloads.
- There is no history of which policy applied when, so changing a rule also changes how past weeks reconcile (#36).
