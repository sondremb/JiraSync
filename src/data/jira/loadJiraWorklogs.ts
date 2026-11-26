import { IsoDate } from "../../date-time/IsoWeek";
import { JiraWorklog } from "../../reconciliation/entities";
import { loadAccountId } from "./loadAccountId";
import { loadWorkedIssueIds } from "./loadWorkedIssueIds";
import { loadIssueWorklogs } from "./loadIssueWorklogs";

export async function loadJiraWorklogs(
	from: IsoDate,
	to: IsoDate,
): Promise<JiraWorklog[]> {
	const [accountId, issueIds] = await Promise.all([
		loadAccountId(),
		loadWorkedIssueIds(from, to),
	]);
	const worklogs = await Promise.all(
		issueIds.map((id) => loadIssueWorklogs(id, from, to, accountId)),
	);
	return worklogs.flat();
}
