import { Middleware } from "openapi-fetch";
import { jiraAuthenticationContext } from "../login/jira/authContext";
import createClient from "openapi-fetch";
import { paths } from "../generated/jira-issues";

function getBaseUrl() {
	const cloudId = import.meta.env.VITE_ATLASSIAN_CLOUD_ID;
	if (!cloudId) {
		throw new Error("VITE_ATLASSIAN_CLOUD_ID must be set");
	}
	return `https://api.atlassian.com/ex/jira/${cloudId}`;
}

const authMiddleWare: Middleware = {
	async onRequest({ request }) {
		const authResult = await jiraAuthenticationContext.getAccessToken();
		if (authResult.kind !== "authenticated") {
			throw new Error("User is not authenticated");
		}

		request.headers.set("Authorization", `Bearer ${authResult.accessToken}`);
		return request;
	},
};

export const jiraClient = createClient<paths>({
	baseUrl: getBaseUrl(),
});
jiraClient.use(authMiddleWare);
