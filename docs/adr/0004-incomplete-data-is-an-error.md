# Incomplete data is an error, not an empty week

When a Jira or Bekk request fails, a response is missing a field needed to account for hours, or pagination can't show that every page was read, the loaders throw and reconciliation fails. They never treat what they have as the whole week. A week that is missing data would show as in sync, or a sync would delete Bekk hours whose Jira worklogs simply weren't loaded, so a visible error is the safer outcome.

The check is about completeness of the pages Jira returned, not about trusting every value: successful responses are taken to match their documented types, and fields are not revalidated one by one. Jira search is eventually consistent and access-controlled, so a complete read still can't prove that Jira has indexed or exposed every recent worklog.
