import moment, { Moment } from "moment";
import { Responses, Day, TKEntry, JiraEntry } from "../types_OLD";
import { jiraIssueToTimecodeId } from "../Jira/constants";
import { toDateString } from "./dateUtils";
import { timeCodeFromId } from "../Timekeeper/constants";

// det er enklere å skrive til objekter/maps nå, og lese fra lister senere
// vi bruker noen midlertidige typer kun mens dataen behandles
declare type TempDays = { [key: string]: TempDay };

interface TempDay extends Omit<Day, "timecodes"> {
	timecodesMap: { [id: string]: TempTKEntry };
}

interface TempTKEntry extends Omit<TKEntry, "jiraEntries"> {
	jiraEntriesMap: { [id: string]: JiraEntry };
}

export const parse = (
	timekeeperResponse: Responses.Timekeeper,
	jiraResponse: Responses.Jira
): Day[] => {
	const lockDate = moment(timekeeperResponse.timesheetLockDate);
	const daysMap: TempDays = {};

	function getOrAddDay(date: Moment): TempDay {
		const dateString = toDateString(date);
		if (!(dateString in daysMap)) {
			daysMap[dateString] = {
				date: date,
				locked: date <= lockDate,
				timecodesMap: {},
				tkHours: 0,
				jiraHours: 0,
			};
		}
		return daysMap[dateString];
	}

	function getOrAddTimecode(date: Moment, timecodeId: number): TempTKEntry {
		const day = getOrAddDay(date);
		if (!(timecodeId in day.timecodesMap)) {
			day.timecodesMap[timecodeId] = {
				...timeCodeFromId(timecodeId),
				hours: 0,
				jiraHours: 0,
				jiraEntriesMap: {},
			};
		}
		return day.timecodesMap[timecodeId];
	}

	timekeeperResponse.timeEntries.forEach((entry) => {
		const date = moment(entry.date);
		const tkEntry = getOrAddTimecode(date, entry.timecodeId);
		tkEntry.hours += entry.hours;
	});

	jiraResponse.worklog.forEach((jiraEntry) => {
		const jiraKey = jiraEntry.key;
		const timecodeId = jiraIssueToTimecodeId(jiraEntry);

		if (!timecodeId) {
			throw `Unable to find timekeeper map for jirakey ${jiraKey}`;
		}

		jiraEntry.entries.forEach((entry) => {
			const date = moment(entry.startDate);
			const tkEntry = getOrAddTimecode(date, timecodeId);

			if (!(jiraKey in tkEntry.jiraEntriesMap)) {
				tkEntry.jiraEntriesMap[jiraKey] = {
					short: jiraKey,
					long: jiraEntry.summary,
					hours: 0,
				};
			}
			const hours = entry.timeSpent / 3600;
			tkEntry.jiraEntriesMap[jiraKey].hours += hours;
			tkEntry.jiraHours += hours;
		});
	});

	// dette ser ekkelt ut, men her flater vi ut map-ene vi har brukt til arrays
	const tempEntryToEntry = (temp: TempTKEntry): TKEntry => {
		const { jiraEntriesMap, ...rest } = temp;
		return { ...rest, jiraEntries: Object.values(jiraEntriesMap) };
	};
	const tempDayToDay = (temp: TempDay): Day => {
		const { timecodesMap, ...rest } = temp;
		return {
			...rest,
			timecodes: Object.values(timecodesMap).map(tempEntryToEntry),
		};
	};
	const days = Object.values(daysMap).map(tempDayToDay);

	return days.sort((d1, d2) => d1.date.valueOf() - d2.date.valueOf());
};
