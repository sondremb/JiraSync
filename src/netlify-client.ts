import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { Jira } from "./types";
import { toDateString } from "./Utils/dateUtils";
import { loadCredentials } from "./Utils/localstorageUtils";

export interface JiraRequestParams {
	fromDate: Moment;
	toDate: Moment;
}

export const JiraClient = {
	getData: (params: JiraRequestParams): Promise<AxiosResponse<Jira.DTO>> => {
		const [username, password] = loadCredentials();
		return axios.post(".netlify/functions/jira-timer", {
			fromDate: toDateString(params.fromDate),
			toDate: toDateString(params.toDate),
			username,
			password,
		});
	},
};
