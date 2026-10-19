import { Jql, Rule, Ruleset } from "../../rules";
import { Policy } from "../contracts";
import {
	InternalTimecodeId,
	JiraIssueId,
	IssueMatchResult,
	JiraMatchResult,
} from "../entities";

type MatchJqls = (
	issues: JiraIssueId[],
	jqls: Jql[],
) => Promise<{ matchedIssues: JiraIssueId[] }[]>;



export function createJqlPolicy(
	ruleset: Ruleset,
	matchJqls: MatchJqls,
): Policy {
	const rules = ruleset.rules;
	const ruleTimecodes = new Set(
		rules.map((rule) => rule.timecode as InternalTimecodeId),
	);

	async function matchIssues(issues: JiraIssueId[]): Promise<JiraMatchResult> {
		if (issues.length === 0) return new Map();
		if (rules.length === 0) {
			return new Map(issues.map((issue) => [issue, { isMatched: false }]));
		}
		const matches = await matchJqls(issues, rules.map(Rule.toFullJql));
		if (matches.length !== rules.length) {
			throw new Error("Match length does not match rules length");
		}

		const result = new Map<JiraIssueId, IssueMatchResult>();
		// assign each issue to the timecode of the first rule it matched
		rules.forEach((rule, index) => {
			const matchedIssues = matches[index].matchedIssues;
			matchedIssues.forEach((issueIdRaw) => {
				const issueId = issueIdRaw as JiraIssueId;
				if (!issues.includes(issueId)) {
					throw new Error("Unexpected issue id from JQL match");
				}
				// issue already matched, first match wins
				if (result.has(issueId)) {
					return;
				}
				result.set(issueId, { isMatched: true, timecodeId: rule.timecode });
			});
		});

		// note unmatched issues
		issues.forEach((issueId) => {
			if (!result.has(issueId)) {
				result.set(issueId, { isMatched: false });
			}
		});

		return result;
	}
	return {
		selectManaged: (ids) =>
			Promise.resolve(new Set(ids.filter((id) => ruleTimecodes.has(id)))),
		matchIssues,
	};
}
