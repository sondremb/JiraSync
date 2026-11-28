import React from "react";
import { useJiraIssueSummary } from "../../data/jira/useJiraIssueSummary";
import type { JiraIssueId } from "../../reconciliation/entities";
import styles from "./JiraIssueName.module.css";

/** Issue key, with its title below in a smaller, subtle font, like `TimecodeName`. */
export const JiraIssueName: React.FC<{ id: JiraIssueId }> = ({ id }) => {
	const issue = useJiraIssueSummary(id);
	if (issue === undefined) return <>Jira-sak {id}</>;
	return (
		<>
			{issue.key}
			<span className={styles.jiraIssueName__summary}>{issue.summary}</span>
		</>
	);
};
