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
const selfBaseUrl = process.env.SELF_BASE_URL;
if (!selfBaseUrl) {
	throw new Error("SELF_BASE_URL must be set");
}

const authBaseUrl = "https://auth.atlassian.com";
const dicoveryUrl = new URL(`${authBaseUrl}/.well-known/openid-configuration`);

export const handler: Handler = async () => {
	const config = await client.discovery(dicoveryUrl, clientId, clientSecret);

	const codeVerifier = client.randomPKCECodeVerifier();
	const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
	const scopes = ["read:jira-work"];

	const parameters = {
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		redirect_uri: `${selfBaseUrl}/.netlify/functions/jira-auth-callback`,
		scope: scopes.join(" "),
		prompt: "consent",
	};

	const authorizationUrl = client.buildAuthorizationUrl(config, parameters);

	const setCookieHeader = cookie.stringifySetCookie({
		name: "code_verifier",
		value: codeVerifier,
		httpOnly: true,
		maxAge: 60 * 5,
	});

	return {
		statusCode: StatusCode.Found302,
		headers: {
			Location: authorizationUrl.href,
			"Set-Cookie": setCookieHeader,
		},
	};
};
