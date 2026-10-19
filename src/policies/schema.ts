import { z } from "zod";
import { type JiraProjectKey } from "../data/issue";
import { type Ruleset, type Rule, type RulesetId, type Jql } from "../rules";
import { type BekkId } from "../types";

const ruleSchema = z.object({
	projectKey: z.string().min(1),
	jql: z.string().min(1).optional(),
	timecode: z.number().int().positive(),
	comment: z.string().optional(),
});

const rulesetSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	rules: z.array(ruleSchema).min(1),
});

const policyFileSchema = z.object({
	schemaVersion: z.literal(1),
	rulesets: z.array(rulesetSchema).min(1),
});

export function loadPolicies(raw: unknown): Ruleset[] {
	const parsed = policyFileSchema.parse(raw);
	return parsed.rulesets.map((r) => ({
		id: r.id as RulesetId,
		name: r.name,
		description: r.description,
		rules: r.rules.map((rule): Rule => ({
			projectKey: rule.projectKey as JiraProjectKey,
			jql: rule.jql as Jql | undefined,
			timecode: rule.timecode as BekkId,
		})),
	}));
}
