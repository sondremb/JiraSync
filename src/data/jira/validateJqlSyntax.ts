import { jiraClient } from "./jiraclient";

export type JqlSyntaxResult = { ok: true } | { ok: false; errors: string[] };

/**
 * Checks syntax only (`validation=none`). Strict validation also rejects
 * projects, components and so on that the user cannot see, but rules may
 * legitimately refer to those, so existence is deliberately not checked.
 */
export async function validateJqlSyntax(jql: string): Promise<JqlSyntaxResult> {
	const { response, data } = await jiraClient.POST("/rest/api/3/jql/parse", {
		params: { query: { validation: "none" } },
		body: { queries: [jql] },
	});
	if (!response.ok || !data) {
		throw new Error("Failed to validate JQL");
	}
	const errors = data.queries.flatMap((query) => query.errors ?? []);
	return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
