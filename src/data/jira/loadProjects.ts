import { jiraClient } from "./jiraclient";

export interface JiraProjectSummary {
	key: string;
	name: string;
}

const pageSize = 100;

/** Projects the current user can browse. Jira omits the rest, so absence proves nothing. */
export async function loadProjects(): Promise<JiraProjectSummary[]> {
	const projects: JiraProjectSummary[] = [];
	let startAt = 0;

	for (;;) {
		const { response, data } = await jiraClient.GET(
			"/rest/api/3/project/search",
			{ params: { query: { startAt, maxResults: pageSize, orderBy: "key" } } },
		);
		if (!response.ok || !data) {
			throw new Error("Failed to fetch Jira projects");
		}
		const values = data.values ?? [];
		for (const project of values) {
			if (project.key) {
				projects.push({ key: project.key, name: project.name ?? project.key });
			}
		}
		// Stop on the last page, and never loop on a page that made no progress.
		if (data.isLast !== false || values.length === 0) {
			return projects;
		}
		startAt += values.length;
	}
}
