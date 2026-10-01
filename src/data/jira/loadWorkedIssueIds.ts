import { IsoDate } from "../../date-time/IsoWeek";
import { JiraIssueId } from "../../reconciliation/entities";
import { jiraClient } from "./jiraclient";

export async function loadWorkedIssueIds(
	from: IsoDate,
	to: IsoDate,
): Promise<JiraIssueId[]> {
	const ids = new Set<JiraIssueId>();
	const seenTokens = new Set<string>();
	let nextPageToken: string | undefined;

	do {
		const page = await fetchIssueSearchPage(from, to, nextPageToken);
		for (const issue of page.issues) {
			ids.add(parseIssueId(issue.id));
		}

		// A non-final page without a cursor would silently omit worked issues.
		if (page.isLast !== true && !page.nextPageToken)
			throw new Error("Incomplete Jira issue search");
		nextPageToken = page.isLast === true ? undefined : page.nextPageToken;
		if (nextPageToken && seenTokens.has(nextPageToken))
			throw new Error("Repeated Jira issue page");
		if (nextPageToken) seenTokens.add(nextPageToken);
	} while (nextPageToken);

	return Array.from(ids);
}

async function fetchIssueSearchPage(
	from: IsoDate,
	to: IsoDate,
	nextPageToken?: string,
) {
	const { response, data } = await jiraClient.GET("/rest/api/3/search/jql", {
		params: {
			query: {
				jql: `worklogDate >= "${from}" AND worklogDate <= "${to}" AND worklogAuthor = currentUser()`,
				fields: ["id"],
				...(nextPageToken ? { nextPageToken } : {}),
			},
		},
	});
	if (!response.ok || !data?.issues)
		throw new Error("Failed to load worked Jira issues");
	return {
		issues: data.issues,
		isLast: data.isLast,
		nextPageToken: data.nextPageToken,
	};
}

function parseIssueId(id: string | undefined): JiraIssueId {
	const numericId = Number(id);
	if (!id || !Number.isSafeInteger(numericId) || numericId <= 0)
		throw new Error("Invalid Jira issue ID");
	return numericId as JiraIssueId;
}
