import axios from "axios";
import { Moment } from "moment";
import { TimecodePutRequest } from "../types_OLD";
import { toDateString } from "../Utils/dateUtils";
import { getIdToken, getEmployeeIdFromToken } from "./auth";

export const getTimekeeperTimesheet = async (
	fromDate: Moment,
	toDate: Moment
) => {
	const employeeId = getEmployeeIdFromToken();
	const url = `https://api.bekk.no/timekeeper-svc/v2/timesheets/employees/${employeeId}?from=${toDateString(
		fromDate
	)}&to=${toDateString(toDate)}`;
	try {
		const response = await axios.get(url, {
			headers: {
				authorization: getAuthorizationHeader(),
			},
		});

		if (response && response.status !== 200) {
			alert(
				`Unable to get timekeeper timesheet, Status: ${
					response.status + response.statusText
				}`
			);
			return null;
		}
		return response;
	} catch (error) {
		alert(`Unable to get timekeeper timesheet, ${error}`);
		return null;
	}
};

export const putTimekeeperData = (data: TimecodePutRequest) => {
	const employeeId = getEmployeeIdFromToken();
	const url = `https://api.bekk.no/timekeeper-svc/timesheets/employee/${employeeId}`;

	return axios
		.put(url, data, {
			headers: {
				authorization: getAuthorizationHeader(),
			},
		})
		.catch((err) => console.log(`Error put ${err}`, url, data));
};

export function getAuthorizationHeader() {
	const bearer_token = getIdToken();
	if (!bearer_token) {
		throw new Error("Brukeren er ikke autentisert");
	}
	return "Bearer " + bearer_token;
}
