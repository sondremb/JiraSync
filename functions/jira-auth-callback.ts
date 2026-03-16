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

		return { statusCode: StatusCode.Ok200, body: JSON.stringify(tokens) };
	} catch (err) {
		console.error("Error during authentication callback:", err);
		return {
			statusCode: StatusCode.InternalServerError500,
			body: "Authentication failed",
		};
	}
};
