import useSWR from "swr";
import { useBekkClient, PutTimesheetParams } from "../bekk-client";
import { NetlifyClient } from "../netlify-client";
import { updateEntries } from "../Utils/stateUtils";
import { useState } from "react";
import { JiraIssue, mapIssue } from "./issue";
import { IsoWeek } from "../date-time/IsoWeek";

export const useWeek = (week: IsoWeek) => {
	const bekkClient = useBekkClient();
	const [jiraIssues, setJiraIssues] = useState<
		Record<string, JiraIssue | undefined>
	>({});
	const monday = IsoWeek.monday(week);
	const sunday = IsoWeek.sunday(week);
	const { data: jiraData } = useSWR(`jira/week/${week}`, () =>
		NetlifyClient.getData({
			fromDate: monday,
			toDate: sunday,
		})
	);

	if (jiraData) {
		const jiraIssueKeys = jiraData.data.worklog.map((entry) => entry.key);
		jiraIssueKeys.forEach((key) => {
			if (!(key in jiraIssues)) {
				NetlifyClient.getIssue(key).then((response) => {
					setJiraIssues((old) => ({
						...old,
						[key]: response.data ? mapIssue(response.data) : undefined,
					}));
				});
			}
		});
	}

	const { data: bekkData, mutate: mutateBekkData } = useSWR(
		`bekk/week/${week}`,
		() =>
			bekkClient.getData({
				fromDate: monday,
				toDate: sunday,
			})
	);

	const { data: timestamp } = useSWR(
		`timestamp/week/${week}`,
		() => new Date()
	);

	const updateBekkHours = (params: PutTimesheetParams) =>
		mutateBekkData(async (old) => {
			await bekkClient.updateTimesheet(params);
			return old;
		});

	const combinedData =
		bekkData &&
		jiraData &&
		jiraData.data.worklog.every((entry) => jiraIssues[entry.key] !== undefined)
			? updateEntries(
					bekkData.data,
					jiraData.data,
					jiraIssues as Record<string, JiraIssue>
			  )
			: undefined;
	return { state: combinedData, timestamp, updateBekkHours };
};
