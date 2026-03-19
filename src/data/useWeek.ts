import useSWR from "swr";
import { useBekkClient, PutTimesheetParams } from "../bekk-client";
import { updateEntries } from "../Utils/stateUtils";
import { IsoWeek } from "../date-time/IsoWeek";
import { useIssues, useWorklogs } from "./newIssue";
import { toRecord, unique } from "../Utils/arrayUtils";

export const useWeek = (week: IsoWeek) => {
	const bekkClient = useBekkClient();
	const monday = IsoWeek.monday(week);
	const sunday = IsoWeek.sunday(week);

	const worklogs = useWorklogs(monday, sunday);
	const issueKeys = unique(worklogs.map((worklog) => worklog.issueKey));
	const issues = useIssues(issueKeys);
	const issuesByKey = toRecord(issues, (issue) => issue.key);

	const { data: bekkData, mutate: mutateBekkData } = useSWR(
		`bekk/week/${week}`,
		() =>
			bekkClient.getData({
				fromDate: monday,
				toDate: sunday,
			}),
	);

	const { data: timestamp } = useSWR(
		`timestamp/week/${week}`,
		() => new Date(),
	);

	const updateBekkHours = (params: PutTimesheetParams) =>
		mutateBekkData(async (old) => {
			await bekkClient.updateTimesheet(params);
			return old;
		});

	const combinedData =
		bekkData &&
		worklogs &&
		worklogs.every((worklog) => issuesByKey[worklog.issueKey] !== undefined)
			? updateEntries(bekkData.data, worklogs, issuesByKey)
			: undefined;
	return { state: combinedData, timestamp, updateBekkHours };
};
