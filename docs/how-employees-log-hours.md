# How employees log hours

Background on the work JiraSync supports: how and when employees log hours in Jira and Bekk, and the locking routine that sets its deadlines. Terms follow `GLOSSARY.md`. Open questions and planned features are GitHub issues, not listed here.

## Two places, one set of hours

Employees log hours twice: as Jira worklogs on Udir's Jira issues, which are invoiced to the customer, and as Bekk entries on Bekk timecodes, Bekk's own record of their hours. Under a policy, every Jira issue belongs to exactly one Bekk timecode, and many issues can share one. Because that mapping is unambiguous, Jira can be the source of truth, and syncing sets the Bekk entries from the Jira worklogs.

Employees work in one of two ways:

- **Jira first:** they log Jira worklogs as they go, at the end of the day or at the end of the week, sometimes with help from a tool such as Toggl or a script that tracks git checkouts. They update Bekk from Jira before the weekly lock. This is the flow JiraSync is built for.
- **Bekk first:** they register Bekk entries daily or weekly and lock on time, then log matching Jira worklogs afterwards, weekly or at the end of the month. This is common for employees who work on only one or a few Jira issues. Syncing from Jira to Bekk doesn't help them until their Jira worklogs are in.

## Locking

Locking sets the employee's lock date. Bekk entries on or before the lock date can't be changed. The lock date applies to the date the work was done, not the date it was registered: an employee who on Monday registers the whole week and locks through Wednesday can still change Thursday and Friday.

- **Weekly:** employees lock through Sunday after each week, usually on Monday morning (the soft deadline is 09:00). Bekk only accepts the lock if the week has at least 37.5 paid hours. Almost every timecode counts as paid, including billable work and time off.
- **Monthly:** employees also lock through the last day of the month. On the first day of the next month, managers check the hours that will be billed, which requires every employee's hours to be in sync. Fixing hours after the month has ended is possible but unwelcome.
- **Unlocking** moves the lock date back, usually to the Friday before the week that needs fixing. Most employees can't unlock their own hours and ask a manager.

## Policy changes

Policies change rarely, in two ways. An employee moves to another team and gets a new policy, usually from a date known in advance such as the first of a month, so one week can fall under two policies. Or a policy itself changes, for everyone who uses it at once. JiraSync doesn't yet decide which policy applies to past work (#36).
