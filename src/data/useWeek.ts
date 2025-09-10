import moment from "moment";
import useSWR from "swr";
import { useBekkClient, PutTimesheetParams } from "../bekk-client";
import { NetlifyClient } from "../netlify-client";
import { WeekAndYear } from "../Utils/dateUtils";
import { updateEntries } from "../Utils/stateUtils";
import { useState } from "react";
import { JiraIssue, mapIssue } from "./issue";

export const useWeek = (weekAndYear: WeekAndYear) => {
	const bekkClient = useBekkClient();
	const [jiraIssues, setJiraIssues] = useState<
		Record<string, JiraIssue | undefined>
	>({});
	const { data: jiraData } = useSWR(
		`jira/week/${weekAndYear.year}/${weekAndYear.week}`,
		() =>
			NetlifyClient.getData({
				fromDate: weekAndYear.start(),
				toDate: weekAndYear.end(),
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
		`bekk/week/${weekAndYear.year}/${weekAndYear.week}`,
		() =>
			bekkClient.getData({
				fromDate: weekAndYear.start(),
				toDate: weekAndYear.end(),
			})
	);

	const { data: timestamp } = useSWR(
		`timestamp/week/${weekAndYear.year}/${weekAndYear.week}`,
		() => moment()
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
