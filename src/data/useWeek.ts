import moment from "moment";
import useSWR from "swr";
import { useBekkClient, PutTimesheetParams } from "../bekk-client";
import { NetlifyClient } from "../netlify-client";
import { WeekAndYear } from "../Utils/dateUtils";
import { updateEntries } from "../Utils/stateUtils";

export const useWeek = (weekAndYear: WeekAndYear) => {
	const bekkClient = useBekkClient();
	const { data: jiraData } = useSWR(
		`jira/week/${weekAndYear.year}/${weekAndYear.week}`,
		() =>
			NetlifyClient.getData({
				fromDate: weekAndYear.start(),
				toDate: weekAndYear.end(),
			})
	);

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
		bekkData && jiraData
			? updateEntries(bekkData.data, jiraData.data)
			: undefined;
	return { state: combinedData, timestamp, updateBekkHours };
};
