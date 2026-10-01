import { jiraClient } from "./jiraclient";

export async function loadAccountId(): Promise<string> {
	const { response, data } = await jiraClient.GET("/rest/api/3/myself");
	if (!response.ok || !data?.accountId)
		throw new Error("Failed to load Jira account");
	return data.accountId;
}
