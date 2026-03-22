import * as client from "openid-client";

export async function getOpenidClientConfig(): Promise<client.Configuration> {
	const clientId = process.env.JIRA_CLIENT_ID;
	if (!clientId) {
		throw new Error("JIRA_CLIENT_ID must be set");
	}
	const clientSecret = process.env.JIRA_CLIENT_SECRET;
	if (!clientSecret) {
		throw new Error("JIRA_CLIENT_SECRET must be set");
	}

	const dicoveryUrl = new URL(
		"https://auth.atlassian.com/.well-known/openid-configuration",
	);

	const config = await client.discovery(dicoveryUrl, clientId, clientSecret);
	return config;
}

export const cookieNames = {
	refreshToken: "refresh_token",
	codeVerifier: "code_verifier",
};
