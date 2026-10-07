import type { IsoDate } from "../date-time/IsoWeek";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { bekkClient } from "./bekkclient";

export async function lockInternalHours(lockDate: IsoDate): Promise<void> {
	const { response, data } = await bekkClient.PUT("/timesheets/lockhours", {
		params: { query: { employeeId: getEmployeeId(), lockDate } },
	});
	if (!response.ok || data?.timesheetSuccessfullyLocked !== true) {
		throw new Error(
			data?.userMessage || `Kunne ikke låse timer til ${lockDate} (${response.status})`,
		);
	}
}
