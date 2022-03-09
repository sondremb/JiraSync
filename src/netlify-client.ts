import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { Jira } from "./types";
import { toDateString } from "./Utils/dateUtils";

export interface NetlifyRequestParams {
	fromDate: Moment;
	toDate: Moment;
	username: string;
	password: string;
}

export const NetlifyClient = {
	getData: (params: NetlifyRequestParams): Promise<AxiosResponse<Jira.DTO>> => {
		return axios.post(".netlify/functions/jira-timer", {
			fromDate: toDateString(params.fromDate),
			toDate: toDateString(params.toDate),
			username: params.username,
			password: params.password,
		});
	},
};
