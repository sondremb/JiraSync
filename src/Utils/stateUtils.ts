import { components } from "../generated/bekk-timekeeper";

type EmployeeTimesheetViewModel =
	components["schemas"]["EmployeeTimesheetViewModel"];
import { BekkTimecodeEntry, DateString, Day, BekkId } from "../types";
import { JiraIssueKey, Worklog } from "../data/issue";
import { IsoDate } from "../date-time/IsoWeek";

export const updateEntries = (
	bekkData: EmployeeTimesheetViewModel,
	worklogs: Worklog[],
	mappings: Record<JiraIssueKey, BekkId>,
): BekkTimecodeEntry[] => {
	const entries = createEntriesFromBekkData(bekkData);
	enrichEntriesWithJiraData(entries, worklogs, mappings);
	return entries;
};

export const createEntriesFromBekkData = (
	data: EmployeeTimesheetViewModel,
): BekkTimecodeEntry[] => {
	const entries: BekkTimecodeEntry[] = [];
	for (const timecode of data.timecodeTimeEntries!) {
		const days: Record<DateString, Day> = {};
		for (const entry of timecode.entries!) {
			days[IsoDate.fromDate(new Date(entry.date!))] = {
				bekkHours: entry.hours!,
				totalJiraHours: 0,
				jiraEntries: [],
			};
		}
		entries.push({
			id: timecode.timecode?.id!,
			days,
		});
	}
	return entries;
};

export const getOrCreateBekkEntry = (
	entries: BekkTimecodeEntry[],
	id: BekkId,
): BekkTimecodeEntry => {
	let entry = entries.find((entry) => entry.id === id);
	if (entry === undefined) {
		entry = { id, days: {} };
		entries.push(entry);
	}
	return entry;
};

export const enrichEntriesWithJiraData = (
	entries: BekkTimecodeEntry[],
	worklogs: Worklog[],
	mappings: Record<JiraIssueKey, BekkId>,
) => {
	for (const worklog of worklogs) {
		const bekkId = mappings[worklog.issue.key];
		const bekkEntry = getOrCreateBekkEntry(entries, bekkId);
		const timestring = IsoDate.fromDate(new Date(worklog.startDate));
		if (!(timestring in bekkEntry.days)) {
			bekkEntry.days[timestring] = {
				bekkHours: 0,
				totalJiraHours: 0,
				jiraEntries: [],
			};
		}
		const hoursSpent = secondsToHours(worklog.timeSpentSeconds);
		bekkEntry.days[timestring].totalJiraHours += hoursSpent;
		bekkEntry.days[timestring].jiraEntries.push({
			id: worklog.issue.key,
			hours: hoursSpent,
		});
	}
};

function secondsToHours(seconds: number): number {
	return seconds / 3600;
}
