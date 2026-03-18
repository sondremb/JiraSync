import { Handler } from "@netlify/functions";
import cookie from "cookie";
import { StatusCode } from "../src/Utils/statuscode";

export const handler: Handler = async () => {
	return Promise.resolve({
		statusCode: StatusCode.Ok200,
		body: "Logged out",
		headers: {
			"Set-Cookie": cookie.stringifySetCookie({
				name: "refresh_token",
				value: "",
				httpOnly: true,
				maxAge: 0,
			}),
		},
	});
};
