import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IsoDate } from "../date-time/IsoWeek";
import { bekkClient } from "./bekkclient";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { lockInternalHours } from "./lockInternalHours";
import type { LockDate } from "../reconciliation/syncPreview";

/** `undefined` until loaded, `null` when the employee has locked nothing yet. */
const lockDateOf = (
	data: { lockDate?: string | null } | undefined,
): LockDate =>
	data === undefined
		? undefined
		: data.lockDate
			? IsoDate.fromDate(new Date(data.lockDate))
			: null;

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
			// No lock date is valid: nothing is locked yet (a new employee).
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
		lockDate: lockDateOf(data),
		error,
		isLoading,
		isFetching,
		updateLockDate,
	};
};
