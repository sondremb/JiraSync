import { Handler } from "@netlify/functions";
import cookie from "cookie";
import { StatusCode } from "../src/Utils/statuscode";
import { cookieNames } from "./cookies";

export const handler: Handler = async () => {
	return Promise.resolve({
		statusCode: StatusCode.Ok200,
		body: "Logged out",
		headers: {
			"Set-Cookie": cookie.stringifySetCookie({
				name: cookieNames.refreshToken,
				value: "",
				httpOnly: true,
				maxAge: 0,
			}),
		},
	});
};
