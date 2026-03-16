import { Handler } from "@netlify/functions";
import * as client from "openid-client";
import { StatusCode } from "../src/Utils/statuscode";
import cookie from "cookie";

const clientId = process.env.JIRA_CLIENT_ID;
if (!clientId) {
	throw new Error("JIRA_CLIENT_ID must be set");
}
const clientSecret = process.env.JIRA_CLIENT_SECRET;
if (!clientSecret) {
	throw new Error("JIRA_CLIENT_SECRET must be set");
}

const authBaseUrl = "https://auth.atlassian.com";
const dicoveryUrl = new URL(`${authBaseUrl}/.well-known/openid-configuration`);

export const handler: Handler = async (event) => {
	const config = await client.discovery(dicoveryUrl, clientId, clientSecret);

	const cookies = cookie.parseCookie(event.headers.cookie ?? "");
	const codeVerifier = cookies["code_verifier"];

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
					name: "refresh_token",
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
