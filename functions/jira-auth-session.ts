import "dotenv/config";
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
	const refreshToken = cookies["refresh_token"];

	if (!refreshToken) {
		return {
			statusCode: StatusCode.Unauthorized401,
			body: "No refresh token found, please log in",
		};
	}

	try {
		const tokens = await client.refreshTokenGrant(config, refreshToken);

		if (!tokens.access_token) {
			throw new Error("No access token received");
		}
		if (!tokens.refresh_token) {
			throw new Error("No new refresh token received");
		}

		return {
			statusCode: StatusCode.Ok200,
			body: JSON.stringify({
				accessToken: tokens.access_token,
				expiresIn: tokens.expires_in,
			}),
			headers: {
				"Set-Cookie": cookie.stringifySetCookie({
					name: "refresh_token",
					value: tokens.refresh_token,
					httpOnly: true,
					// 90 days, as per https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/#use-a-refresh-token-to-get-another-access-token-and-refresh-token-pair
					maxAge: 60 * 60 * 24 * 90,
				}),
				Location: "/",
			},
		};
	} catch (err) {
		console.error("Error during token refresh:", err);
		return {
			statusCode: StatusCode.InternalServerError500,
			body: "Authentication failed",
		};
	}
};
