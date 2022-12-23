import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { getJiraCredentials } from "./jiraCredentials";
import { Jira } from "./types";
import { toDateString } from "./Utils/dateUtils";

export interface NetlifyRequestParams {
	fromDate: Moment;
	toDate: Moment;
}

export const NetlifyClient = {
	getData: (params: NetlifyRequestParams): Promise<AxiosResponse<Jira.DTO>> => {
		const credentials = getJiraCredentials();
		// TODO
		if (credentials == null) {
			throw Error("AAA");
		}
		return axios.post(".netlify/functions/jira-timer", {
			fromDate: toDateString(params.fromDate),
			toDate: toDateString(params.toDate),
			username: credentials.username,
			password: credentials.password,
		});
	},
};
