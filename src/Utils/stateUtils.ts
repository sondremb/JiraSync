import { EmployeeTimesheetViewModelDTO } from "../bekk-api/data-contracts";
import { bekkIdFromJiraTimecode } from "../timecode-map";
import { BekkTimecodeEntry, DateString, Day, BekkId, Seconds } from "../types";
import { JiraIssue, JiraIssueId, JiraIssueKey } from "../data/issue";
import { IsoDate } from "../date-time/IsoWeek";

export const updateEntries = (
	bekkData: EmployeeTimesheetViewModelDTO,
	worklogs: Worklog[],
	jiraIssues: Record<string, JiraIssue> = {},
): BekkTimecodeEntry[] => {
	const entries = createEntriesFromBekkData(bekkData);
	enrichEntriesWithJiraData(entries, worklogs, jiraIssues);
	return entries;
};

export const createEntriesFromBekkData = (
	data: EmployeeTimesheetViewModelDTO,
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

interface Worklog {
	issueId: JiraIssueId;
	issueKey: JiraIssueKey;
	startDate: IsoDate;
	timeSpentSeconds: Seconds;
}

export const enrichEntriesWithJiraData = (
	entries: BekkTimecodeEntry[],
	worklogs: Worklog[],
	jiraIssues: Record<string, JiraIssue> = {},
) => {
	for (const worklog of worklogs) {
		const bekkId = bekkIdFromJiraTimecode(jiraIssues[worklog.issueKey]);
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
			id: worklog.issueKey,
			hours: hoursSpent,
		});
	}
};

function secondsToHours(seconds: number): number {
	return seconds / 3600;
}
