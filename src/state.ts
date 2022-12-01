import moment, { Moment } from "moment";
import { useEffect, useState } from "react";
import { BekkClient } from "./bekk-client";
import { useCallableStatefulRequest } from "./client-utils";
import { NetlifyClient } from "./netlify-client";
import { bekkIdFromJiraTimecode } from "./timecode-map";
import {
	Bekk,
	BekkId,
	BekkTimecodeEntry,
	DateString,
	Day,
	Jira,
} from "./types.d";
import { getJiraCredentials } from "./jiraCredentials";
import { secondsToHours, toDateString } from "./Utils/dateUtils";

interface FetchAllDataParams {
	fromDate: Moment;
	toDate: Moment;
}

export const useCombinedState = () => {
	const [entries, setEntries] = useState<BekkTimecodeEntry[]>([]);
	const jiraCredentials = getJiraCredentials();

	const jiraRequest = useCallableStatefulRequest({
		requestFunction: (params: FetchAllDataParams) =>
			NetlifyClient.getData({
				fromDate: params.fromDate,
				toDate: params.toDate,
				// TODO dette er klovn
				username: jiraCredentials?.username ?? "",
				password: jiraCredentials?.password ?? "",
			}),
	});

	const bekkRequest = useCallableStatefulRequest({
		requestFunction: BekkClient.getData,
	});

	const fetchAllData = (params: FetchAllDataParams) => {
		jiraRequest.execute(params);
		bekkRequest.execute(params);
	};

	useEffect(() => {
		const jiraData = jiraRequest.data;
		if (jiraData !== undefined) {
			if (!bekkRequest.loading && bekkRequest.data !== undefined) {
				updateEntries(bekkRequest.data, jiraData);
			}
		}
	}, [jiraRequest.data]);

	useEffect(() => {
		const bekkData = bekkRequest.data;
		if (bekkData !== undefined) {
			if (!jiraRequest.loading && jiraRequest.data !== undefined) {
				updateEntries(bekkData, jiraRequest.data);
			}
		}
	}, [bekkRequest.data]);

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
			entries,
		},
		fetchBekkData: bekkRequest.execute,
		fetchJiraData: jiraRequest.execute,
		fetchAllData,
		pending: bekkRequest.loading || jiraRequest.loading,
	};
};
