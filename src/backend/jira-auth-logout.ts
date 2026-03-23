import { Handler } from "@netlify/functions";
import cookie from "cookie";
import { StatusCode } from "../Utils/statuscode";
import { cookieNames } from "./utils";

export const handler: Handler = async () => {
	return Promise.resolve({
		statusCode: StatusCode.Found302,
		headers: {
			Location: "/",
			"Set-Cookie": cookie.stringifySetCookie({
				name: cookieNames.refreshToken,
				value: "",
				httpOnly: true,
				maxAge: 0,
			}),
		},
	});
};
