import moment, { Moment } from "moment";
import useSWR from "swr";
import { getEmployeeIdFromToken } from "../auth";
import { Timesheets } from "../bekk-api/Timesheets";
import { BekkClient } from "../bekk-client";
import { createClient } from "../Utils/bekkClientUtils";
import { toDateString } from "../Utils/dateUtils";

export const useLockDate = () => {
	const client = createClient(Timesheets);
	const { data, mutate, error } = useSWR("lockdate", () =>
		client.lockdatesDetail(getEmployeeIdFromToken())
	);

	const updateLockDate = (lockDate: Moment) =>
		mutate(async (old) => {
			const lockDateAsString = toDateString(lockDate);
			await BekkClient.setLockDate(lockDateAsString);
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
