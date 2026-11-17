# The lock date is an input to sync planning

Bekk's API already rejects writes on or before an employee's lock date, so JiraSync could leave that to Bekk. We decided to make the lock date an input to sync planning instead: no change is ever proposed on a locked day, and nothing is proposed while the lock date is unknown. If we relied on Bekk, a sync that touched locked days would fail partway through and leave the week half-updated, and the preview would promise changes that cannot happen. A locked day that disagrees with Jira is reported as not in sync, but it cannot be fixed.
