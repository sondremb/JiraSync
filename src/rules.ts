import { JiraProjectKey } from "./data/issue";
import { BekkId } from "./types";
import { Brand } from "./Utils/brandedTypes";

export type RulesetId = Brand<string, "RulesetId">;
export type Jql = Brand<string, "Jql">;

export interface Ruleset {
	id: RulesetId;
	name: string;
	description?: string;
	rules: Rule[];
}

export interface Rule {
	projectKey: JiraProjectKey;
	jql?: Jql;
	timecode: BekkId;
}

export const Rule = {
	toFullJql: (rule: Rule): Jql => {
		const projectClause = `project = '${rule.projectKey}'`;
		if (!rule.jql) {
			return projectClause as Jql;
		}
		return `${projectClause} AND (${rule.jql})` as Jql;
	},
};
