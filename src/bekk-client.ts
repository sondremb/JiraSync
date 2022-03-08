import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { getAuthorizationHeader } from "./Timekeeper";
import { getEmployeeIdFromToken } from "./Timekeeper/auth";
import { Bekk } from "./types";
import { toDateString } from "./Utils/dateUtils";

export interface BekkRequestParams {
	fromDate: Moment;
	toDate: Moment;
}

const BASE_URL = "https://api.bekk.no/timekeeper-svc";

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
};
