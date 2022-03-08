import moment, { Moment } from "moment";
import { useEffect, useState } from "react";
import { BekkClient } from "./bekk-client";
import { useCallableRequest } from "./client-utils";
import { JiraClient } from "./netlify-client";
import {
	bekkIdFromJiraTimecode,
	knownBekkTimecodes,
	UdirBekkIds,
} from "./timecode-map";
import {
	Bekk,
	BekkId,
	BekkTimecode,
	BekkTimecodeEntry,
	BekkTimecodeMap,
	DateString,
	Day,
	Jira,
	JiraTimecode,
	JiraTimecodeMap,
} from "./types.d";
import { secondsToHours, toDateString } from "./Utils/dateUtils";

interface FetchAllDataParams {
	fromDate: Moment;
	toDate: Moment;
}

export const useCombinedState = () => {
	const [bekkTimecodes, setBekkTimecodes] =
		useState<BekkTimecodeMap>(knownBekkTimecodes);
	const [jiraTimecodes, setJiraTimecodes] = useState<JiraTimecodeMap>({});
	const [entries, setEntries] = useState<BekkTimecodeEntry[]>([]);
	const [lockDate, setLockDate] = useState<Moment>();

	const jiraRequest = useCallableRequest({
		requestFunction: JiraClient.getData,
	});

	const bekkRequest = useCallableRequest({
		requestFunction: BekkClient.getData,
	});

	const fetchAllData = (params: FetchAllDataParams) => {
		jiraRequest.execute(params);
		bekkRequest.execute(params);
	};

	useEffect(() => {
		const jiraData = jiraRequest.data;
		if (jiraData !== undefined) {
			updateJiraTimecodesFromData(jiraData);
			if (!bekkRequest.loading && bekkRequest.data !== undefined) {
				updateEntries(bekkRequest.data, jiraData);
			}
		}
	}, [jiraRequest.data]);

	useEffect(() => {
		const bekkData = bekkRequest.data;
		if (bekkData !== undefined) {
			updateBekkTimecodesFromData(bekkData);
			setLockDate(moment(bekkData.lockDate));
			if (!jiraRequest.loading && jiraRequest.data !== undefined) {
				updateEntries(bekkData, jiraRequest.data);
			}
		}
	}, [bekkRequest.data]);

	const updateJiraTimecodesFromData = (data: Jira.DTO) => {
		let newTimecodes: Record<Jira.Timecode["key"], JiraTimecode> = {};
		for (const timecode of data.worklog) {
			newTimecodes[timecode.key] = {
				key: timecode.key,
				summary: timecode.summary,
				bekkTimecodeId: bekkIdFromJiraTimecode(timecode),
			};
		}
		setJiraTimecodes({ ...jiraTimecodes, ...newTimecodes });
	};

	const updateBekkTimecodesFromData = (data: Bekk.DTO) => {
		let newTimecodes: Record<BekkId, BekkTimecode> = {};
		for (const timecode of data.timecodeTimeEntries) {
			const id = timecode.timecode.id;
			newTimecodes[id] = {
				id,
				code: timecode.timecode.code,
				name: timecode.timecode.name,
				isUdir: id in UdirBekkIds,
			};
		}
		setBekkTimecodes({ ...bekkTimecodes, ...newTimecodes });
	};

	const updateEntries = (bekkData: Bekk.DTO, jiraData: Jira.DTO) => {
		const entries = createEntriesFromBekkData(bekkData);
		enrichEntriesWithJiraData(entries, jiraData);
		setEntries(entries);
	};

	const createEntriesFromBekkData = (data: Bekk.DTO): BekkTimecodeEntry[] => {
		const entries: BekkTimecodeEntry[] = [];
		for (const timecode of data.timecodeTimeEntries) {
			const days: Record<DateString, Day> = {};
			for (const entry of timecode.entries) {
				days[toDateString(moment(entry.date))] = {
					bekkHours: entry.hours,
					totalJiraHours: 0,
					jiraEntries: [],
				};
			}
			entries.push({
				id: timecode.timecode.id,
				days,
			});
		}
		return entries;
	};

	const getOrCreateBekkEntry = (
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

	const enrichEntriesWithJiraData = (
		entries: BekkTimecodeEntry[],
		data: Jira.DTO
	) => {
		for (const timecode of data.worklog) {
			const bekkId = bekkIdFromJiraTimecode(timecode);
			if (!entries.find((entry) => entry.id === bekkId)) {
				entries.push({ id: bekkId, days: {} });
			}
			const bekkEntry = getOrCreateBekkEntry(entries, bekkId);
			for (const entry of timecode.entries) {
				const timestring = toDateString(moment(entry.startDate));
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

	return {
		state: {
			bekkTimecodes,
			jiraTimecodes,
			lockDate,
			entries,
		},
		fetchBekkData: bekkRequest.execute,
		fetchJiraData: jiraRequest.execute,
		fetchAllData,
		pending: bekkRequest.loading || jiraRequest.loading,
	};
};
