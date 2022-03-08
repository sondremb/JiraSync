import axios from "axios";

export const getJiraTimesheet = (
	username: string,
	password: string,
	fromDate: string,
	toDate: string
) => {
	const url = ".netlify/functions/jira-timer";
	return axios.post(url, {
		fromDate,
		toDate,
		username,
		password,
	});
};
