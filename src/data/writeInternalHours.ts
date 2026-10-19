import { getEmployeeId } from "../login/bekk/bekkLogin";
import { ProposedChange } from "../reconciliation/syncPreview";
import { bekkClient } from "./bekkclient";

export async function writeInternalHours(
	change: ProposedChange,
): Promise<void> {
	const employeeId = getEmployeeId();
	if (change.targetHours === 0) {
		const { response } = await bekkClient.DELETE(
			"/timesheets/employee/{employeeId}",
			{
				params: { path: { employeeId } },
				body: { timecodeId: change.timecodeId, date: change.date },
			},
		);
		if (!response.ok)
			throw new Error(
				`Internal System rejected the deletion (${response.status})`,
			);
		return;
	}

	const { response, data } = await bekkClient.PUT(
		"/timesheets/employee/{employeeId}",
		{
			params: { path: { employeeId } },
			body: {
				timecodeId: change.timecodeId,
				date: change.date,
				hours: change.targetHours,
				comment: "",
			},
		},
	);
	if (!response.ok || !data)
		throw new Error(`Internal System rejected the update (${response.status})`);
	if (data.validationInfo?.length)
		throw new Error(data.validationInfo.join(", "));
}
