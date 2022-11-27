import moment from "moment";
import useSWR from "swr";
import { BekkClient } from "../bekk-client";

export const useLockDate = () => {
	const { data, error } = useSWR("lockdate", () => BekkClient.getLockDate());

	return {
		lockDate: data ? moment(data?.data.lockDate) : undefined,
		error,
		isLoading: !error && !data,
	};
};
