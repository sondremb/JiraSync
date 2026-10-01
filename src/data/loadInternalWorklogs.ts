import { isValid, parseISO } from "date-fns";
import { IsoDate } from "../date-time/IsoWeek";
import { components } from "../generated/bekk-timekeeper";
import { getEmployeeId } from "../login/bekk/bekkLogin";
import { InternalTimecodeId, InternalWork } from "../reconciliation/entities";
import { bekkClient } from "./bekkclient";

type TimecodeGroup = components["schemas"]["TimecodeTimeEntriesViewModel"];
type TimeEntry = components["schemas"]["TimeEntryViewModel"];

export async function loadInternalWorklogs(
	from: IsoDate,
	to: IsoDate,
): Promise<InternalWork[]> {
	const { response, data } = await bekkClient.GET(
		"/v3/timesheets/employees/{employeeId}",
		{
			params: {
				path: { employeeId: getEmployeeId() },
				query: { From: from, To: to },
			},
		},
	);
	if (!response.ok || !data?.timecodeTimeEntries)
		throw new Error("Failed to load Internal timesheet");
	return data.timecodeTimeEntries.flatMap((group) =>
		mapTimecodeGroup(group, from, to),
	);
}

function mapTimecodeGroup(
	group: TimecodeGroup,
	from: IsoDate,
	to: IsoDate,
): InternalWork[] {
	const id = group.timecode?.id;
	if (id == null || !group.entries)
		throw new Error("Invalid Internal timesheet group");
	return group.entries.map((entry) =>
		mapEntry(entry, id as InternalTimecodeId, from, to),
	);
}

function mapEntry(
	entry: TimeEntry,
	timecodeId: InternalTimecodeId,
	from: IsoDate,
	to: IsoDate,
): InternalWork {
	if (entry.date == null || entry.hours == null || !Number.isFinite(entry.hours))
		throw new Error("Invalid Internal timesheet entry");
	const date = toWorkDate(entry.date);
	if (date < from || date > to)
		throw new Error("Internal timesheet entry outside requested range");
	if (entry.timecodeId != null && entry.timecodeId !== timecodeId)
		throw new Error("Internal timecode ID mismatch");
	return { date, timecodeId, hoursWorked: entry.hours };
}

function toWorkDate(value: string): IsoDate {
	// Offset-bearing values are instants; local/date-only values denote calendar days.
	if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || !isValid(parseISO(value)))
		throw new Error("Invalid Internal timesheet entry");
	return /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
		? IsoDate.fromDate(new Date(value))
		: IsoDate.parse(value.slice(0, 10));
}
