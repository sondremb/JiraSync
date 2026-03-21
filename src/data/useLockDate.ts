import { useNotification } from "@utdanningsdirektoratet/lisa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmployeeId } from "../login/bekk/example2";
import { IsoDate } from "../date-time/IsoWeek";
import { bekkClient } from "./bekkclient";

export const useLockDate = () => {
	const queryClient = useQueryClient();
	const showNotification = useNotification();

	const { data, error, isLoading } = useQuery({
		queryKey: ["bekk", "lockdate"],
		queryFn: async () => {
			const { data, response } = await bekkClient.GET(
				"/timesheets/lockdates/{employeeId}",
				{ params: { path: { employeeId: getEmployeeId() } } },
			);
			if (!response.ok) throw new Error("Failed to fetch lock date");
			return data;
		},
	});

	const { mutate: updateLockDate } = useMutation({
		mutationFn: (lockDate: IsoDate) =>
			bekkClient.PUT("/timesheets/lockhours", {
				params: { query: { employeeId: getEmployeeId(), lockDate } },
			}),
		onSuccess: (_, lockDate) => {
			queryClient.invalidateQueries({ queryKey: ["bekk", "lockdate"] });
			showNotification({
				type: "success",
				// TODO formatter
				content: `Låste timer frem til ${lockDate}`,
			});
		},
		onError: (error: any) => {
			showNotification({
				type: "error",
				title: "Kunne ikke låse timer",
				content: error?.error?.userMessage ?? "Ingen detaljer",
			});
		},
	});

	return {
		lockDate: data?.lockDate
			? IsoDate.fromDate(new Date(data.lockDate))
			: undefined,
		error,
		isLoading,
		updateLockDate,
	};
};
