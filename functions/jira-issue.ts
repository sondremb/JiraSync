import { Handler } from "@netlify/functions";
import { getJiraIssue } from "../src/jira-client";

export const handler: Handler = async (event, context) => {
	return getJiraIssue(
		event.body ? JSON.parse(event.body) : null,
		context.awsRequestId
	);
};
