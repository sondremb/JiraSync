import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateEntries } from "../Utils/stateUtils";
import { IsoDate, IsoWeek } from "../date-time/IsoWeek";
import { useWorklogs } from "./newIssue";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { bekkClient } from "./bekkclient";
import { BekkId } from "../types";

export interface PutTimesheetParams {
	timecodeId: BekkId;
	date: IsoDate;
	hours: number;
	comment?: string;
}

export const useWeek = (week: IsoWeek) => {
	const queryClient = useQueryClient();
	const monday = IsoWeek.monday(week);
	const sunday = IsoWeek.sunday(week);

	const worklogs = useWorklogs(monday, sunday);

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
		mutationFn: async (params: PutTimesheetParams) =>
			await doUpdateBekkHours(
				params.timecodeId,
				params.date,
				params.hours,
				params.comment,
			),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["bekk", "week", week] }),
	});

	const bekkData = bekkQuery.data;
	const timestamp =
		bekkQuery.dataUpdatedAt > 0 ? new Date(bekkQuery.dataUpdatedAt) : undefined;

	const combinedData =
		bekkData && worklogs ? updateEntries(bekkData, worklogs) : undefined;

	return { state: combinedData, timestamp, updateBekkHours };
};

async function doUpdateBekkHours(
	timecodeId: BekkId,
	date: IsoDate,
	hours: number,
	comment?: string,
) {
	if (hours === 0) {
		await bekkClient.DELETE("/timesheets/employee/{employeeId}", {
			params: {
				path: { employeeId: getEmployeeId() },
			},
			body: {
				timecodeId,
				date,
			},
		});
	} else {
		await bekkClient.PUT("/timesheets/employee/{employeeId}", {
			params: { path: { employeeId: getEmployeeId() } },
			body: {
				timecodeId,
				hours,
				date,
				comment: comment ?? "",
			},
		});
	}
}
