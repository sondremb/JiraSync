import { Moment } from "moment";

interface Arguments {
	update: boolean;
	verbose: boolean;
	from?: string;
	to?: string;
}

declare namespace Responses {
	// Jira
	interface Jira {
		worklog: Worklog[];
		startDate: number;
		endDate: number;
	}

	interface Worklog {
		key: string;
		summary: string;
		entries: Entry[];
		fields: Field[];
	}

	interface Entry {
		id: number;
		comment: string;
		timeSpent: number;
		author: string;
		authorFullName: string;
		created: any;
		startDate: any;
		updateAuthor: string;
		updateAuthorFullName: string;
		updated: any;
	}

	interface Field {
		label: string;
		value: string;
	}

	// Timekeeper
	interface Timekeeper {
		timeEntries: TimeEntry[];
		timesheetLockDate: Date;
	}

	interface TimeEntry {
		employeeId: number;
		comment: string;
		hours: number;
		date: Date;
		timecodeId: number;
		billable: number;
		projectId: number;
	}
}

interface TimecodePutRequest {
	employeeId: number;
	comment: string;
	hours: number;
	date: string;
	timecodeId: number;
	billable: boolean;
}

interface Day {
	date: Moment;
	locked?: boolean;
	timecodes: TKEntry[];
	tkHours: number;
	jiraHours: number;
}

interface TKEntry extends TKTimecode {
	hours: number;
	jiraHours: number;
	jiraEntries: JiraEntry[];
}

interface JiraTimecode {
	short: string;
	long: string;
}

interface JiraEntry extends JiraTimecode {
	hours: number;
}

interface TKTimecode {
	short: string;
	long: string;
	isPAS: boolean;
}
