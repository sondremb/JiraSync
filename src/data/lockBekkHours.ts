import type { IsoDate } from "../date-time/IsoWeek";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import type { SignedOvertime } from "../overtime/overtime";
import { bekkClient } from "./bekkclient";

/**
 * Locks Bekk hours through `lockDate`. A lock that closes a month must sign
 * that month's overtime in the same request.
 */
export async function lockBekkHours(
	lockDate: IsoDate,
	signedOvertime?: SignedOvertime,
): Promise<void> {
	const { response, data, error } = await bekkClient.PUT(
		"/timesheets/lockhours",
		{
			params: { query: { employeeId: getEmployeeId(), lockDate } },
			body: signedOvertime,
		},
	);
	if (!response.ok || data?.timesheetSuccessfullyLocked !== true) {
		// Bekk explains a rejected lock in `userMessage`, on errors too.
		const userMessage =
			data?.userMessage ||
			(error as { userMessage?: string } | undefined)?.userMessage;
		throw new Error(
			userMessage ||
				`Kunne ikke låse timer til ${lockDate} (${response.status})`,
		);
	}
}
