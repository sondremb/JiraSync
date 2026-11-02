import { jiraClient } from "./jiraclient";

export interface JiraComponentSummary {
	id: string;
	name: string;
}

/**
 * Components of a project. Jira answers 404 both for a project that does not
 * exist and for one the user cannot see, so that case is an empty list.
 */
export async function loadProjectComponents(
	projectKey: string,
): Promise<JiraComponentSummary[]> {
	const { response, data } = await jiraClient.GET(
		"/rest/api/3/project/{projectIdOrKey}/components",
		{ params: { path: { projectIdOrKey: projectKey } } },
	);
	if (response.status === 404) {
		return [];
	}
	if (!response.ok || !data) {
		throw new Error(`Failed to fetch components for ${projectKey}`);
	}
	return data.flatMap((component) =>
		component.id && component.name
			? [{ id: component.id, name: component.name }]
			: [],
	);
}
