import { Moment } from "moment";

type DateString = string;
type UnixTimestamp = number;
type Seconds = number;

declare namespace Bekk {
	interface Employee {
		divisionId: number;
		departmentId: number;
		id: number;
		name: string;
		mobilePhone: string;
		department: string;
	}

	interface Timecode {
		id: number;
		code: string;
		name: string;
		billable: boolean;
		workPerformed: boolean;
		projectId: number;
		timecodeCategoryId: number;
	}

	interface Entry {
		employeeId: number;
		comment: string;
		hours: number;
		date: DateString;
		timecodeId: number;
		billable: boolean;
		projectId: number;
	}

	interface TimecodeWithEntries {
		timecode: Timecode;
		entries: Entry[];
	}

	interface DTO {
		employee: Employee;
		lockDate: DateString;
		timecodeTimeEntries: TimecodeWithEntries[];
	}
}

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
type BekkId = Bekk.Timecode["id"];
type JiraId = Jira.Timecode["key"];
type BekkTimecode = Pick<Bekk.Timecode, "id" | "code" | "name"> & {
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

type BekkTimecodeMap = Record<BekkId, BekkTimecode>;
type JiraTimecodeMap = Record<JiraId, JiraTimecode>;

interface State {
	entries: BekkTimecodeEntry[];
	bekkTimecodes: BekkTimecodeMap;
	jiraTimecodes: JiraTimecodeMap;
}
