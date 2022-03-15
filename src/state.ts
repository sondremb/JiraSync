import moment, { Moment } from "moment";
import { useEffect, useState } from "react";
import { BekkClient } from "./bekk-client";
import { useCallableStatefulRequest } from "./client-utils";
import { NetlifyClient } from "./netlify-client";
import {
	addBekkTimecodesAction,
	addJiraTimecodesAction,
} from "./store/actions";
import { useStore } from "./store/store";
import { bekkIdFromJiraTimecode, UdirBekkIds } from "./timecode-map";
import {
	Bekk,
	BekkId,
	BekkTimecodeEntry,
	DateString,
	Day,
	Jira,
} from "./types.d";
import { secondsToHours, toDateString } from "./Utils/dateUtils";

interface FetchAllDataParams {
	fromDate: Moment;
	toDate: Moment;
}

export const useCombinedState = () => {
	const { state, dispatch } = useStore();
	const [entries, setEntries] = useState<BekkTimecodeEntry[]>([]);
	const [lockDate, setLockDate] = useState<Moment>();

	const jiraRequest = useCallableStatefulRequest({
		requestFunction: (params: FetchAllDataParams) =>
			NetlifyClient.getData({
				fromDate: params.fromDate,
				toDate: params.toDate,
				username: state.jiraUsername,
				password: state.jiraPassword,
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
		dispatch(
			addJiraTimecodesAction(
				data.worklog.map((timecode) => ({
					key: timecode.key,
					summary: timecode.summary,
					bekkTimecodeId: bekkIdFromJiraTimecode(timecode),
				}))
			)
		);
	};

	const updateBekkTimecodesFromData = (data: Bekk.DTO) => {
		dispatch(
			addBekkTimecodesAction(
				data.timecodeTimeEntries.map((timecode) => ({
					id: timecode.timecode.id,
					code: timecode.timecode.code,
					name: timecode.timecode.name,
					isUdir: timecode.timecode.id in UdirBekkIds,
				}))
			)
		);
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
			lockDate,
			entries,
		},
		fetchBekkData: bekkRequest.execute,
		fetchJiraData: jiraRequest.execute,
		fetchAllData,
		pending: bekkRequest.loading || jiraRequest.loading,
	};
};
