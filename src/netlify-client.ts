import axios, { AxiosResponse } from "axios";
import { Moment } from "moment";
import { getJiraCredentials, JiraCredentials } from "./jiraCredentials";
import { Jira } from "./types";
import { toDateString } from "./Utils/dateUtils";
import { JiraIssueResult } from "./jira-client";

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
	getIssue: (key: string): Promise<AxiosResponse<JiraIssueResult>> => {
		const credentials = getJiraCredentials();
		// TODO
		if (credentials == null) {
			throw Error("AAA");
		}
		return axios.post(".netlify/functions/jira-issue", {
			ticketKey: key,
			username: credentials.username,
			password: credentials.password,
		});
	},
	authenticate: (
		credentials: JiraCredentials
	): Promise<AxiosResponse<Jira.DTO>> => {
		return axios.post(".netlify/functions/jira-timer", {
			username: credentials.username,
			password: credentials.password,
		});
	},
};
