# Jira does the matching

A rule pairs a Jira project with an optional JQL condition, and JiraSync asks Jira's `/jql/match` API which issues each rule matches. We decided not to write our own matching engine or condition language, because rules depend on Jira fields such as components, epics and custom fields whose meaning only Jira knows. The cost is that matching needs a Jira round trip per reconciliation, that matching is limited to what the employee can see in Jira, and that the fake backend has to evaluate a subset of JQL itself.
