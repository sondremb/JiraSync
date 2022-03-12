import { Response } from "@netlify/functions/dist/function/response";
import axios from "axios";
import { DateString } from "./types";

interface JiraRequestParams {
	username: string;
	password: string;
	toDate: DateString;
	fromDate: DateString;
}

const delivery_field_name = "customfield_10702";

export const getJiraTimesheet = async (
	body: Partial<JiraRequestParams> | null
): Promise<Response> => {
	if (body === null) {
		return {
			body: "Missing request body",
			statusCode: 400,
		};
	}
	const { fromDate, toDate, username, password } = body;
	if (!username || !password) {
		return {
			body: "Missing username or password",
			statusCode: 401,
		};
	}
	if (!fromDate || !toDate) {
		return {
			body: "Missing fromDate or toDate",
			statusCode: 400,
		};
	}

	const url = `https://jira.udir.no/rest/timesheet-gadget/1.0/raw-timesheet.json?startDate=${fromDate}&endDate=${toDate}&moreFields=${delivery_field_name}`;
	return axios
		.get(url, {
			auth: {
				username: username,
				password: password,
			},
		})
		.then((res) => ({ statusCode: 200, body: JSON.stringify(res.data) }))
		.catch((err) => err);
};
