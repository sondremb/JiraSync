import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IsoDate } from "../date-time/IsoWeek";
import { bekkClient } from "./bekkclient";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { lockInternalHours } from "./lockInternalHours";

export const useLockDate = () => {
	const queryClient = useQueryClient();

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey: ["bekk", "lockdate"],
		queryFn: async () => {
			const { data, response } = await bekkClient.GET(
				"/timesheets/lockdates/{employeeId}",
				{ params: { path: { employeeId: getEmployeeId() } } },
			);
			if (!response.ok || !data?.lockDate)
				throw new Error("Failed to fetch lock date");
			return data;
		},
	});

	const updateLockDate = useMutation({
		mutationFn: lockInternalHours,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["bekk", "lockdate"] });
		},
	});

	return {
		lockDate: data?.lockDate
			? IsoDate.fromDate(new Date(data.lockDate))
			: undefined,
		error,
		isLoading,
		isFetching,
		updateLockDate,
	};
};
