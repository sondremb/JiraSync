import "dotenv/config";
import { Handler } from "@netlify/functions";
import * as client from "openid-client";
import { StatusCode } from "../src/Utils/statuscode";
import cookie from "cookie";
import { cookieNames } from "./cookies";

export const handler: Handler = async () => {
	const clientId = process.env.JIRA_CLIENT_ID;
	if (!clientId) {
		throw new Error("JIRA_CLIENT_ID must be set");
	}
	const clientSecret = process.env.JIRA_CLIENT_SECRET;
	if (!clientSecret) {
		throw new Error("JIRA_CLIENT_SECRET must be set");
	}
	const selfBaseUrl =
		process.env.OVERRIDE_DEPLOY_URL ??
		process.env.DEPLOY_PRIME_URL ??
		process.env.URL;
	if (!selfBaseUrl) {
		throw new Error("DEPLOY_URL must be set");
	}

	const authBaseUrl = "https://auth.atlassian.com";
	const dicoveryUrl = new URL(
		`${authBaseUrl}/.well-known/openid-configuration`,
	);

	const config = await client.discovery(dicoveryUrl, clientId, clientSecret);

	const codeVerifier = client.randomPKCECodeVerifier();
	const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
	const scopes = ["read:jira-work", "read:jira-user", "offline_access"];

	const parameters = {
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		redirect_uri: `${selfBaseUrl}/.netlify/functions/jira-auth-callback`,
		scope: scopes.join(" "),
		prompt: "consent",
	};

	const authorizationUrl = client.buildAuthorizationUrl(config, parameters);

	const setCookieHeader = cookie.stringifySetCookie({
		name: cookieNames.codeVerifier,
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
