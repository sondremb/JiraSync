import { Middleware } from "openapi-fetch";
import { jiraAuthenticationContext } from "../../login/jira/authContext";
import createClient from "openapi-fetch";
import { paths } from "../../generated/jira-issues";
import { config } from "../../Utils/envUtils";

function getBaseUrl() {
	const cloudId = config.jira.cloudId;
	return `https://api.atlassian.com/ex/jira/${cloudId}`;
}

async function getBearerToken(): Promise<string> {
	const authResult = await jiraAuthenticationContext.getAccessToken();
	if (authResult.kind !== "authenticated") {
		throw new Error("User is not authenticated");
	}
	return `Bearer ${authResult.accessToken}`;
}

// Unconsumed copies of outgoing requests, so a 401 can be retried with a fresh token
const retryableRequests = new WeakMap<Request, Request>();

const authMiddleWare: Middleware = {
	async onRequest({ request }) {
		request.headers.set("Authorization", await getBearerToken());
		retryableRequests.set(request, request.clone());
		return request;
	},
	async onResponse({ request, response }) {
		const retryRequest = retryableRequests.get(request);
		retryableRequests.delete(request);
		if (response.status !== 401 || !retryRequest) {
			return response;
		}
		// The cached token was rejected despite looking valid locally; fetch a new one and retry once
		jiraAuthenticationContext.invalidate();
		retryRequest.headers.set("Authorization", await getBearerToken());
		return fetch(retryRequest);
	},
};

export const jiraClient = createClient<paths>({
	baseUrl: getBaseUrl(),
});
jiraClient.use(authMiddleWare);
