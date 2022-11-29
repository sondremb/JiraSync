import moment from "moment";
import useSWR from "swr";
import { getEmployeeIdFromToken } from "../auth";
import { Timesheets } from "../bekk-api/Timesheets";
import { createClient } from "../Utils/bekkClientUtils";

export const useLockDate = () => {
	const client = createClient(Timesheets);
	const { data, error } = useSWR("lockdate", () =>
		client.lockdatesDetail(getEmployeeIdFromToken())
	);

	// TODO error handling
	return {
		lockDate: data ? moment(data?.data.lockDate) : undefined,
		error,
		isLoading: !error && !data,
	};
};
