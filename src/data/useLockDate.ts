import { useNotification } from "@udir/lisa";
import moment, { Moment } from "moment";
import useSWR from "swr";
import { Timesheets } from "../bekk-api/Timesheets";
import { useBekkClient } from "../bekk-client";
import { getEmployeeIdFromToken } from "../login/bekk/token";
import { useClient } from "../Utils/bekkClientUtils";
import { toDateString } from "../Utils/dateUtils";

export const useLockDate = () => {
	const client = useClient(Timesheets);
	const { data, mutate, error } = useSWR("lockdate", () =>
		client.lockdatesDetail(getEmployeeIdFromToken())
	);
	const showNotification = useNotification();

	const bekkClient = useBekkClient();
	const updateLockDate = (lockDate: Moment) =>
		mutate(async (old) => {
			const lockDateAsString = toDateString(lockDate);
			await bekkClient
				.setLockDate(lockDateAsString)
				.then(() =>
					showNotification({
						type: "success",
						content: `Låste timer frem til ${lockDate.format("Do MMMM YYYY")}`,
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
		lockDate: data ? moment(data?.data.lockDate) : undefined,
		error,
		isLoading: !error && !data,
		updateLockDate,
	};
};
