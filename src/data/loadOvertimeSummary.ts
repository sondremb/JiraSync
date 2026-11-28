import type { components } from "../generated/bekk-timekeeper";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import type { OvertimeSummary, YearMonth } from "../overtime/overtime";
import { bekkClient } from "./bekkclient";

type BekkOvertimeSummary = components["schemas"]["OvertimeSummaryViewModel"];

export const overtimeSummaryFromBekk = (
	summary: BekkOvertimeSummary,
): OvertimeSummary => {
	const { hoursForSigning } = summary;
	const clearing = hoursForSigning.halfYearFlexClearing;
	const payoutHours = clearing?.flexBalanceForPayout ?? 0;
	const deletedHours = clearing?.flexBalanceForDeletion ?? 0;
	return {
		month: { year: summary.year, month: summary.month },
		fromWeek: summary.fromWeek,
		toWeek: summary.toWeek,
		overtimeHours: summary.overtimeHours,
		flexBalanceHours: summary.flexBalanceHours,
		mandatoryFlex: hoursForSigning.mandatoryFlex,
		mandatoryPayout: hoursForSigning.mandatoryPayout,
		allocatable: hoursForSigning.allocatable,
		...(payoutHours !== 0 || deletedHours !== 0
			? { halfYearClearing: { payoutHours, deletedHours } }
			: {}),
	};
};

export async function loadOvertimeSummary(
	month: YearMonth,
): Promise<OvertimeSummary> {
	const employeeId = getEmployeeId();
	const { data, response } = await bekkClient.GET(
		"/overtime/employees/{employeeId}/summary",
		{ params: { path: { employeeId }, query: month } },
	);
	if (!response.ok || !data) {
		throw new Error(`Kunne ikke hente overtid (${response.status})`);
	}
	return overtimeSummaryFromBekk(data);
}
