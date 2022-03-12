import { Response } from "@netlify/functions/dist/function/response";
import axios, { AxiosError } from "axios";
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
	try {
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
			.catch((err: AxiosError) => {
				if (err.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					console.log("response");
					console.log(err.response.data);
					console.log(err.response.status);
					console.log(err.response.headers);
				} else if (err.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js
					console.log("request", err.request);
				} else {
					// Something happened in setting up the request that triggered an Error
					console.log("Error", err.message);
				}
				console.log(err.config);
				return { statusCode: 500 };
			});
	} catch (e: unknown) {
		let body = "";
		if (typeof e === "string") {
			body = e; // works, `e` narrowed to string
		} else if (e instanceof Error) {
			body = e.message; // works, `e` narrowed to Error
		}
		return { statusCode: 500, body };
	}
};
