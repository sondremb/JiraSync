import { EmployeeTimesheetViewModelDTO } from "../bekk-api/data-contracts";
import { bekkIdFromJiraTimecode } from "../timecode-map";
import { Jira, BekkTimecodeEntry, DateString, Day, BekkId } from "../types";
import { JiraIssue } from "../data/issue";
import { IsoDate } from "../date-time/IsoWeek";

export const updateEntries = (
	bekkData: EmployeeTimesheetViewModelDTO,
	jiraData: Jira.DTO,
	jiraIssues: Record<string, JiraIssue> = {}
): BekkTimecodeEntry[] => {
	const entries = createEntriesFromBekkData(bekkData);
	enrichEntriesWithJiraData(entries, jiraData, jiraIssues);
	return entries;
};

export const createEntriesFromBekkData = (
	data: EmployeeTimesheetViewModelDTO
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
	id: BekkId
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
	data: Jira.DTO,
	jiraIssues: Record<string, JiraIssue> = {}
) => {
	for (const timecode of data.worklog) {
		const bekkId = bekkIdFromJiraTimecode(jiraIssues[timecode.key]);
		const bekkEntry = getOrCreateBekkEntry(entries, bekkId);
		for (const entry of timecode.entries) {
			const timestring = IsoDate.fromDate(new Date(entry.startDate));
			if (!(timestring in bekkEntry.days)) {
				bekkEntry.days[timestring] = {
					bekkHours: 0,
					totalJiraHours: 0,
					jiraEntries: [],
				};
			}
			const hoursSpent = secondsToHours(entry.timeSpent);
			bekkEntry.days[timestring].totalJiraHours += hoursSpent;
			bekkEntry.days[timestring].jiraEntries.push({
				id: timecode.key,
				hours: hoursSpent,
			});
		}
	}
};

function secondsToHours(seconds: number): number {
	return seconds / 3600;
}
