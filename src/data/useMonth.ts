import moment from "moment";
import useSWR from "swr";
import { useBekkClient, PutTimesheetParams } from "../bekk-client";
import { NetlifyClient } from "../netlify-client";
import { MonthAndYear } from "../Utils/dateUtils";
import { updateEntries } from "../Utils/stateUtils";

export const useMonth = (monthAndYear: MonthAndYear) => {
	const { data: jiraData } = useSWR(
		`jira/month/${monthAndYear.year}/${monthAndYear.month}`,
		() =>
			NetlifyClient.getData({
				fromDate: monthAndYear.startOfFirstWeek(),
				toDate: monthAndYear.endOfLastWeek(),
			})
	);

	const bekkClient = useBekkClient();
	const { data: bekkData, mutate: mutateBekkData } = useSWR(
		`bekk/month/${monthAndYear.year}/${monthAndYear.month}`,
		() =>
			bekkClient.getData({
				fromDate: monthAndYear.startOfFirstWeek(),
				toDate: monthAndYear.endOfLastWeek(),
			})
	);

	const { data: timestamp } = useSWR(
		`timestamp/month/${monthAndYear.year}/${monthAndYear.month}`,
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
