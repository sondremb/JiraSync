import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bekkClient } from "./bekkclient";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { lockBekkHours } from "./lockBekkHours";
import type { IsoDate } from "../date-time/IsoWeek";
import type { SignedOvertime } from "../overtime/overtime";
import { lockDateFromBekk } from "./lockDateFromBekk";

export interface LockRequest {
	lockDate: IsoDate;
	/** Required when the lock closes a month. */
	signedOvertime?: SignedOvertime;
}

export const useLockDate = () => {
	const queryClient = useQueryClient();

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey: ["bekk", "lockdate"],
		queryFn: async () => {
			const { data, response } = await bekkClient.GET(
				"/timesheets/lockdates/{employeeId}",
				{ params: { path: { employeeId: getEmployeeId() } } },
			);
			if (!response.ok || !data) throw new Error("Failed to fetch lock date");
			// A response without a lock date is valid: nothing is locked yet.
			return data;
		},
	});

	const updateLockDate = useMutation({
		mutationFn: ({ lockDate, signedOvertime }: LockRequest) =>
			lockBekkHours(lockDate, signedOvertime),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["bekk", "lockdate"] });
		},
	});

	return {
		lockDate: lockDateFromBekk(data),
		error,
		isLoading,
		isFetching,
		updateLockDate,
	};
};
