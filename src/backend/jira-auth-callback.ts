import { Handler } from "@netlify/functions";
import * as client from "openid-client";
import { StatusCode } from "../Utils/statuscode";
import cookie from "cookie";
import { cookieNames, getOpenidClientConfig } from "./utils";

export const handler: Handler = async (event) => {
	const config = await getOpenidClientConfig();

	const cookies = cookie.parseCookie(event.headers.cookie ?? "");
	const codeVerifier = cookies[cookieNames.codeVerifier];

	try {
		const tokens = await client.authorizationCodeGrant(
			config,
			new URL(event.rawUrl),
			{
				pkceCodeVerifier: codeVerifier,
			},
		);

		const refreshToken = tokens.refresh_token;

		if (!refreshToken) {
			throw new Error("No refresh token received");
		}

		return {
			statusCode: StatusCode.Found302,
			headers: {
				"Set-Cookie": cookie.stringifySetCookie({
					name: cookieNames.refreshToken,
					value: refreshToken,
					httpOnly: true,
					// 90 days, as per https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/#use-a-refresh-token-to-get-another-access-token-and-refresh-token-pair
					maxAge: 60 * 60 * 24 * 90,
				}),
				Location: "/",
			},
		};
	} catch (err) {
		console.error("Error during authentication callback:", err);
		return {
			statusCode: StatusCode.InternalServerError500,
			body: "Authentication failed",
		};
	}
};
