import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { Timesheets } from "./bekk-api/Timesheets";
import {
	getAuthorizationHeader,
	getEmployeeIdFromToken,
} from "./login/bekk/token";
import { Bekk, BekkId, DateString } from "./types";
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
	getData: (params: BekkRequestParams): Promise<AxiosResponse<Bekk.DTO>> => {
		const employeeId = getEmployeeIdFromToken();
		const url = `${BASE_URL}/v3/timesheets/employees/${employeeId}?from=${toDateString(
			params.fromDate
		)}&to=${toDateString(params.toDate)}`;
		return axios.get(url, {
			headers: { authorization: getAuthorizationHeader() },
		});
	},
	updateTimesheet: (params: PutTimesheetParams) => {
		const employeeId = getEmployeeIdFromToken();
		const url = `${BASE_URL}/timesheets/employee/${employeeId}`;
		return axios.put(
			url,
			{
				timecodeId: params.timecodeId,
				hours: params.hours,
				date: params.dateString,
				employeeId,
				comment: "",
			},
			{
				headers: { authorization: getAuthorizationHeader() },
			}
		);
	},
	setLockDate: (lockDate: DateString) => {
		const client = createClient(Timesheets);
		return client.lockhoursUpdate({
			employeeId: getEmployeeIdFromToken(),
			lockDate,
		});
	},
};
