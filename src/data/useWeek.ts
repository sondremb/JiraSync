import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateEntries } from "../Utils/stateUtils";
import { IsoWeek } from "../date-time/IsoWeek";
import { useIssues, useWorklogs } from "./newIssue";
import { toRecord, unique } from "../Utils/arrayUtils";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { bekkClient } from "./bekkclient";
import { BekkId, DateString } from "../types";

export interface PutTimesheetParams {
	timecodeId: BekkId;
	dateString: DateString;
	hours: number;
}

export const useWeek = (week: IsoWeek) => {
	const queryClient = useQueryClient();
	const monday = IsoWeek.monday(week);
	const sunday = IsoWeek.sunday(week);

	const worklogs = useWorklogs(monday, sunday);
	const issueKeys = unique(worklogs.map((worklog) => worklog.issueKey));
	const issues = useIssues(issueKeys);
	const issuesByKey = toRecord(issues, (issue) => issue.key);

	const bekkQuery = useQuery({
		queryKey: ["bekk", "week", week],
		queryFn: async () => {
			const { data, response } = await bekkClient.GET(
				"/v3/timesheets/employees/{employeeId}",
				{
					params: {
						path: { employeeId: getEmployeeId() },
						query: { From: monday, To: sunday },
					},
				},
			);
			if (!response.ok) throw new Error("Failed to fetch week data");
			return data;
		},
	});

	const { mutate: updateBekkHours } = useMutation({
		mutationFn: (params: PutTimesheetParams) =>
			bekkClient.PUT("/timesheets/employee/{employeeId}", {
				params: { path: { employeeId: getEmployeeId() } },
				body: {
					timecodeId: params.timecodeId,
					hours: params.hours,
					date: params.dateString,
					comment: "",
				},
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["bekk", "week", week] }),
	});

	const bekkData = bekkQuery.data;
	const timestamp =
		bekkQuery.dataUpdatedAt > 0 ? new Date(bekkQuery.dataUpdatedAt) : undefined;

	const combinedData =
		bekkData &&
		worklogs &&
		worklogs.every((worklog) => issuesByKey[worklog.issueKey] !== undefined)
			? updateEntries(bekkData, worklogs, issuesByKey)
			: undefined;

	return { state: combinedData, timestamp, updateBekkHours };
};
