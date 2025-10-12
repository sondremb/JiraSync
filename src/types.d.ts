export type DateString = string;
export type UnixTimestamp = number;
export type Seconds = number;

declare namespace Jira {
	interface DTO {
		startDate: UnixTimestamp;
		endDate: UnixTimestamp;
		worklog: Timecode[];
	}

	interface Timecode {
		key: string;
		summary: string;
		entries: Entry[];
		fields: Field[];
	}

	interface Entry {
		author: string;
		authorFullName: string;
		comment: string;
		created: UnixTimestamp;
		id: number;
		startDate: UnixTimestamp;
		timeSpent: Seconds;
		updateAuthor: string;
		updateAuthorFullName: string;
		updated: UnixTimestamp;
	}

	interface Field {
		label: string;
		value: string;
	}
}

// STATE
type BekkId = TimecodeViewModelV2DTO["id"];
type JiraId = Jira.Timecode["key"];
type BekkTimecode = Pick<TimecodeViewModelV2DTO, "id" | "code" | "name"> & {
	isUdir: boolean;
};
interface JiraTimecode extends Pick<Jira.Timecode, "key" | "summary"> {
	bekkTimecodeId: BekkId;
}

interface JiraEntry {
	id: JiraId;
	hours: number;
}

interface Day {
	bekkHours: number;
	totalJiraHours: number;
	jiraEntries: JiraEntry[];
}

type DateEntryMap = Record<DateString, Day>;
interface BekkTimecodeEntry {
	id: BekkId;
	days: DateEntryMap;
}

type BekkTimecodeMap = Record<BekkId, TimecodeViewModelV2DTO>;

interface State {
	entries: BekkTimecodeEntry[];
	bekkTimecodes: BekkTimecodeMap;
}
