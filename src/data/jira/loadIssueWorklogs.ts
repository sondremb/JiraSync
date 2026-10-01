import { addDays } from "date-fns";
import { IsoDate } from "../../date-time/IsoWeek";
import { JiraIssueId, JiraWork } from "../../reconciliation/entities";
import { jiraClient } from "./jiraclient";
import { components } from "../../generated/jira-issues";

type Worklog = components["schemas"]["Worklog"];

export async function loadIssueWorklogs(
	issueId: JiraIssueId,
	from: IsoDate,
	to: IsoDate,
	accountId: string,
): Promise<JiraWork[]> {
	const startedAfter =
		IsoDate.toDateAt(from, { hours: 0, minutes: 0 }).getTime() - 1;
	const dayAfterTo = IsoDate.fromDate(addDays(IsoDate.toDate(to), 1));
	const startedBefore = IsoDate.toDateAt(dayAfterTo, {
		hours: 0,
		minutes: 0,
	}).getTime();
	const work: JiraWork[] = [];
	let startAt = 0;

	// Each page advances startAt or the operation fails; return when total is reached.
	while (true) {
		const page = await fetchWorklogPage(
			issueId,
			startAt,
			startedAfter,
			startedBefore,
		);
		if (page.worklogs.length === 0 && startAt < page.total) {
			throw new Error(`Incomplete worklogs for Jira issue ${issueId}`);
		}
		for (const entry of page.worklogs) {
			const { date, authorId, hoursWorked } = mapWorklog(entry, issueId);
			// Issue search finds candidates; this endpoint also returns other authors and dates.
			if (authorId === accountId && date >= from && date <= to)
				work.push({ issueId, date, hoursWorked });
		}
		startAt += page.worklogs.length;
		if (startAt >= page.total) return work;
	}
}

async function fetchWorklogPage(
	issueId: JiraIssueId,
	startAt: number,
	startedAfter: number,
	startedBefore: number,
) {
	const { response, data } = await jiraClient.GET(
		"/rest/api/3/issue/{issueIdOrKey}/worklog",
		{
			params: {
				path: { issueIdOrKey: String(issueId) },
				query: { startedAfter, startedBefore, startAt },
			},
		},
	);
	if (
		!response.ok ||
		!data?.worklogs ||
		data.startAt == null ||
		data.total == null
	)
		throw new Error(
			`Failed to load complete worklogs for Jira issue ${issueId}`,
		);
	return { worklogs: data.worklogs, startAt: data.startAt, total: data.total };
}

function mapWorklog(entry: Worklog, issueId: JiraIssueId) {
	const seconds = entry.timeSpentSeconds;
	if (
		!entry.author?.accountId ||
		!entry.started ||
		seconds == null ||
		!Number.isFinite(seconds) ||
		seconds < 0
	) {
		throw new Error(`Invalid worklog for Jira issue ${issueId}`);
	}
	const instant = new Date(entry.started);
	if (Number.isNaN(instant.getTime()))
		throw new Error(`Invalid worklog for Jira issue ${issueId}`);
	return {
		authorId: entry.author.accountId,
		date: IsoDate.fromDate(instant),
		hoursWorked: seconds / 3600,
	};
}
