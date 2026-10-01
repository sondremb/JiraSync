import { IsoDate } from "../../date-time/IsoWeek";
import { JiraWork } from "../../reconciliation/entities";
import { loadAccountId } from "./loadAccountId";
import { loadWorkedIssueIds } from "./loadWorkedIssueIds";
import { loadIssueWorklogs } from "./loadIssueWorklogs";

export async function loadJiraWorklogs(
	from: IsoDate,
	to: IsoDate,
): Promise<JiraWork[]> {
	const accountId = await loadAccountId();
	const issueIds = await loadWorkedIssueIds(from, to);
	const worklogs = await Promise.all(
		issueIds.map((id) => loadIssueWorklogs(id, from, to, accountId)),
	);
	return worklogs.flat();
}
