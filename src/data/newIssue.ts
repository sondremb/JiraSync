import createClient from "openapi-fetch";
import { paths } from "../generated/jira-issues";
import useSWR from "swr";
import { IsoDate } from "../date-time/IsoWeek";
import { JiraIssueKey } from "./issue";

function getBaseUrl() {
	const cloudId = import.meta.env.VITE_ATLASSIAN_CLOUD_ID;
	if (!cloudId) {
		throw new Error("VITE_ATLASSIAN_CLOUD_ID must be set");
	}
	return `https://api.atlassian.com/ex/jira/${cloudId}`;
}

export function useIssue(issueKey: string) {
	const accessToken = localStorage.getItem("atlassian_access_token");
	const client = createClient<paths>({
		baseUrl: getBaseUrl(),
		headers: {
			Authorization: `Bearer ${accessToken ?? ""}`,
		},
	});
	const { data } = useSWR(issueKey, () =>
		client.GET("/rest/api/3/issue/{issueIdOrKey}", {
			params: {
				path: {
					issueIdOrKey: issueKey,
				},
			},
		}),
	);
	console.log("Fetched issue data:", JSON.stringify(data, null, 2));
	return data?.data ?? null;
}

export function useWorkedIssues(fromDate: IsoDate, toDate: IsoDate) {
	const accessToken = localStorage.getItem("atlassian_access_token");
	const client = createClient<paths>({
		baseUrl: getBaseUrl(),
		headers: { Authorization: `Bearer ${accessToken ?? ""}` },
	});
	const { data } = useSWR(`worklogs/${fromDate}/${toDate}`, () =>
		client.GET("/rest/api/3/search/jql", {
			params: {
				query: {
					jql: `worklogDate >= "${fromDate}" AND worklogDate <= "${toDate}" AND worklogAuthor = currentUser()`,
				},
			},
		}),
	);
	return data?.data?.issues ?? [];
}

export function getIssueWorklogs(issueKey: JiraIssueKey) {
	const accessToken = localStorage.getItem("atlassian_access_token");
	const client = createClient<paths>({
		baseUrl: getBaseUrl(),
		headers: { Authorization: `Bearer ${accessToken ?? ""}` },
	});
	return client.GET("/rest/api/3/issue/{issueIdOrKey}/worklog", {
		params: { path: { issueIdOrKey: issueKey } },
	});
}
