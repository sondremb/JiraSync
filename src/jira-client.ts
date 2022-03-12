import { Response } from "@netlify/functions/dist/function/response";
import axios, { AxiosError } from "axios";
import {
	JIRA_CAPTCHA,
	JIRA_LOGIN,
	NETLIFY_MISSING_AUTH,
	NETLIFY_MISSING_DATES,
	UNKNOWN_NETLIFY_ERROR,
} from "./errorstore/errors";
import { DateString } from "./types";

interface JiraRequestParams {
	username: string;
	password: string;
	toDate: DateString;
	fromDate: DateString;
}

export enum StatusCode {
	OK_200 = 200,
	BAD_REQUEST_400 = 400,
	UNAUTHORIZED_401 = 401,
	FORBIDDEN_403 = 403,
	INTERNAL_SERVER_ERROR_500 = 500,
}

const delivery_field_name = "customfield_10702";

export const getJiraTimesheet = async (
	body: Partial<JiraRequestParams> | null,
	eventId: string
): Promise<Response> => {
	if (body === null) {
		return {
			body: "Missing request body",
			statusCode: StatusCode.BAD_REQUEST_400,
		};
	}
	const { fromDate, toDate, username, password } = body;
	if (!username || !password) {
		return {
			body: NETLIFY_MISSING_AUTH,
			statusCode: StatusCode.UNAUTHORIZED_401,
		};
	}
	if (!fromDate || !toDate) {
		return {
			body: NETLIFY_MISSING_DATES,
			statusCode: StatusCode.BAD_REQUEST_400,
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
		.catch((err: AxiosError) => handleError(err, eventId));
};

const handleError = (error: AxiosError, eventId: string): Response => {
	// error.config.auth holder authorization-headeren som sendes til Jira, inkludert passord i plaintext
	// vi sletter den før vi gjør noe som helst annet med error, for å unngå noen form for lekkasje til log
	delete error.config.auth;

	if (error.response) {
		if (
			error.response.status === StatusCode.UNAUTHORIZED_401 &&
			error.response.headers["x-seraph-loginreason"] === "AUTHENTICATED_FAILED"
		) {
			return { statusCode: StatusCode.UNAUTHORIZED_401, body: JIRA_LOGIN };
		} else if (
			error.response.status === StatusCode.FORBIDDEN_403 &&
			error.response.headers["x-seraph-loginreason"] ===
				"AUTHENTICATION_DENIED" &&
			error.response.headers["x-authentication-denied-reason"]?.includes(
				"CAPTCHA_CHALLENGE"
			)
		) {
			return { statusCode: StatusCode.FORBIDDEN_403, body: JIRA_CAPTCHA };
		}
		console.error("An unhandled error response was received from Jira");
		console.error("Status code: " + error.response.status);
		console.log("Headers: ", error.response.headers);
	} else if (error.request) {
		console.error("Request was made to jira but no response was received");
		console.log("Error request: ", error.request);
	} else {
		console.error("An error occurred in setting up the request to Jira");
		console.error("Error message: ", error.message);
	}
	console.error("Error config: ", error.config);
	// TODO send med event id
	return {
		statusCode: StatusCode.INTERNAL_SERVER_ERROR_500,
		body: UNKNOWN_NETLIFY_ERROR + " " + eventId,
	};
};
