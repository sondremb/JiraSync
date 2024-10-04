import { Moment } from "moment";
import { Timesheets } from "./bekk-api/Timesheets";
import { V3 } from "./bekk-api/V3";
import { getEmployeeIdFromToken } from "./login/bekk/token";
import { BekkId, DateString } from "./types";
import { createClient } from "./Utils/bekkClientUtils";
import { toDateString } from "./Utils/dateUtils";
import { isDevelopment } from "./Utils/envUtils";

export interface BekkRequestParams {
	fromDate: Moment;
	toDate: Moment;
}

export interface PutTimesheetParams {
	timecodeId: BekkId;
	dateString: DateString;
	hours: number;
}

export interface GetLockdateReturn {
	employeeId: number;
	lockDate: DateString;
}

export const BASE_URL = isDevelopment()
	? "https://api.bekk.dev/timekeeper-svc"
	: "https://api.bekk.no/timekeeper-svc";

export const BekkClient = {
	getData: (params: BekkRequestParams) => {
		const employeeId = getEmployeeIdFromToken();
		const client = createClient(V3);
		return client.timesheetsEmployeesDetail(employeeId, {
			From: toDateString(params.fromDate),
			To: toDateString(params.toDate),
		});
	},
	updateTimesheet: (params: PutTimesheetParams) => {
		const employeeId = getEmployeeIdFromToken();
		const client = createClient(Timesheets);
		return client.employeeUpdate(employeeId, {
			timecodeId: params.timecodeId,
			hours: params.hours,
			date: params.dateString,
			comment: "",
		});
	},
	setLockDate: (lockDate: DateString) => {
		const client = createClient(Timesheets);
		return client.lockhoursUpdate({
			employeeId: getEmployeeIdFromToken(),
			lockDate,
		});
	},
};
