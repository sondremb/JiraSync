import { Middleware } from "openapi-fetch";
import { jiraAuthenticationContext } from "../login/jira/authContext";
import createClient from "openapi-fetch";
import { paths } from "../generated/jira-issues";
import { config } from "../Utils/envUtils";

function getBaseUrl() {
	const cloudId = config.jira.cloudId;
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
