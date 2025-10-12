import { useNotification } from "@udir/lisa";
import useSWR from "swr";
import { Timesheets } from "../bekk-api/Timesheets";
import { useBekkClient } from "../bekk-client";
import { useEmployeeId } from "../login/bekk/example2";
import { useClient } from "../Utils/bekkClientUtils";
import { IsoDate } from "../date-time/IsoWeek";

export const useLockDate = () => {
	const client = useClient(Timesheets);
	const employeeId = useEmployeeId();
	const { data, mutate, error } = useSWR("lockdate", () =>
		client.lockdatesDetail(employeeId)
	);
	const showNotification = useNotification();

	const bekkClient = useBekkClient();
	const updateLockDate = (lockDate: IsoDate) =>
		mutate(async (old) => {
			await bekkClient
				.setLockDate(lockDate)
				.then(() =>
					showNotification({
						type: "success",
						// TODO formatter
						content: `Låste timer frem til ${lockDate}`,
					})
				)
				.catch((error: any) => {
					showNotification({
						type: "error",
						title: "Kunne ikke låse timer",
						content: error?.error?.userMessage ?? "Ingen detaljer",
					});
				});
			return old;
		});

	// TODO error handling
	return {
		lockDate: data?.data.lockDate
			? IsoDate.fromDate(new Date(data.data.lockDate))
			: undefined,
		error,
		isLoading: !error && !data,
		updateLockDate,
	};
};
