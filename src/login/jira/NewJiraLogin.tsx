import { Link } from "@utdanningsdirektoratet/lisa";
import React from "react";

const jiraAccessTokenKey = "jiraAccessToken";

export const NewJiraLogin: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const token = localStorage.getItem(jiraAccessTokenKey);

	if (!token) {
		return (
			<Link url=".netlify/functions/jira-authentication">Logg inn i Jira</Link>
		);
	}

	return <>{children}</>;
};
