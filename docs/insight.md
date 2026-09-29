This is a system for helping synchronize work logs across two systems.
User log hours on Issues in Jira, and on Timecodes in an Internal System.

The general rule:
When a person is under a given Contract, there is a many-to-one relationship between Issues and Timecodes. That is, for a given Contract, an Issue Maps to exactly one Timecode - many issues may map to the same Timecode.

Synced/In Sync:
The user's logged work is considered Synced (or In Sync) for a given day if: 
For each Timecode in the Contract, the sum of hours logged in Jira on Issues that Map to that Timecode on that day is equal to the hours logged on the Timecode itself in the Internal System on that day.
The user's logged work is considered Synced for a period of days if it is Synced for each day in the period.
Hours logged on Timecodes not in the Contract do not affect the Sync status.
Ideally, all of a user's logged hours in Jira should be covered by the Contract. The case where they are not is considered undefined behavior.

Synchronizing/Syncing:
Since Issue-to-Timecode mapping is unambiguous, we can choose to consider Jira hours the ground truth. Using this, we can consider the process of setting Internal hours equal to what they should be based on Jira hours. We call this process Syncing/Synchronization.

Proposed implementation:
A Contract is a prioritized list of Rules. A Rule consists of a Jira Project, a Timecode and optionally a JQL string.
For a given time period, the user's logged Issues are fetched from Jira. Each Issue is tested against each Rule, and is assigned to the Timecode of the first Rule it Matches. A Contract thus also has an implicit set of Timecodes it manages.
Hours logged on Issues not covered by the Contract (i.e. do not match any Rule) should be flagged and shown to the user.

Locking
Hours logged in the Internal System can be Locked. Locking means setting their Lock Date to a given date. Work logged on days prior to the Lock Date cannot be changed. This applies to the date of the work, not the date the logging happened. 
E.g.: If the user on Monday logs work for the entire week, and sets the Lock Date to Wednesday, they can still at any time change their work logs for Thursday and Friday, but may not change their logs of work logged for Monday through Wednesday.

Hours can be Unlocked, which just means that their Lock Date is set back to before a given point. Unlocking hours for a week usually means setting the Lock Date to the Friday before the given week. Most users lack the permission to Unlock their own hours, and require help from someone with higher access, such as a Manager.

Users are required to Lock their hours in the Internal System after each week - most users do this Monday morning (there is a soft deadline at 09:00). That means setting the Lock Date to Sunday. This requires that they have logged a full week (at least 37.5 hours) of Paid hours. Almost all timecodes are considered Paid work, including billable work, and time off.

They are also required to lock their hours at the end of each month. On the first day of the next month, Managers will check billling work. This requires that all their Managees (and their own) logged work hours are Synced. If this is not the case, Managers contact their Managees to have them update their work logs, Unlocking the month if necessary. It is highly preferred to not have to rectify hours after the end of the month.

User behaviors
Some users work Jira-first: they log hours in Jira as they work, or at the end of day, or maybe even at the end of week (or start of the next). They update their hours in the Internal System based on their logged Jira hours, at the latest at the start of the next week (for the required Locking).
Some use external help for tracking Jira hours. This could be an existing tool like Toggle, or a homemade script that tracks hours based on git checkouts.

Some users work Internal-first: they log hours in the Internal System, either each day or each week, locking at the end/start of week as required. They look at their logged hours and log appropriate hours in Jira afterwards, either weekly or at the end of the month. This is usually common for users who log work on a single or very few Jira Issues.

Contract Reassignment and changes
Sometimes there are changes. Either a person moves to a new team, and is assigned to a new Contract. Usually this is known ahead of time, so that their Contract changes on a given date, e.g. the first of the next month. In this case they may be assigned to two Contracts within the same week.
Sometimes a Contract may change, so that all the people belonging to the Contract receive the same update at the same time.
Both of these are relatively rare.

Questions
Can/Should the application be "multi tenant" with regards to multiple Confluence/Jira instances?
Should the application model Manager/Managee relations?
Should the application support Contract reassignments?
How should Contract creation, assignment and editing work?

Rewrite
Remove customer-specific references (as good as possible)
More hosting agnostic
Move away from Lisa design system - use one of: Udir design system (design.udir.no) | digdir design system | kilden (https://kilden.design/)
    Current preference: digdir with default theme. Established, maintained, not customer-specific
Better mobile support
Fixes:
    Know when time tracking requires comment
    Handle overtime when locking month
    Don't crash when Issue has no Mapping
    Don't crash when user lacks access to Timecode
New features?:
    logging arbitrary Internal hours
    Rule-drafting tool (nice-to-have, second-order priority): start new or copy existing policy, discover Jira components and Internal timecodes using the signed-in user's access, and export a full proposed policy for developer review and read-only publication.
    sync-to-jira?
    View without mapping
