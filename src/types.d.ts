export type DateString = string;
export type UnixTimestamp = number;
export type Seconds = number;

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
