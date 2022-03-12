import { Handler } from "@netlify/functions";
import { getJiraTimesheet } from "../src/jira-client";

export const handler: Handler = async (event, context) => {
	return getJiraTimesheet(
		event.body ? JSON.parse(event.body) : null,
		context.awsRequestId
	);
};
