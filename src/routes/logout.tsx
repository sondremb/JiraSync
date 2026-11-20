import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { jiraAuthenticationContext } from "../login/jira/authContext";
import { Page } from "../layout/Page";
import { jiraLoginHref } from "../login/jira/loginHref";

export const Route = createFileRoute("/logout")({
	component: RouteComponent,
	loader: async () => {
		await jiraAuthenticationContext.logout();
	},
});

function RouteComponent() {
	return (
		<Page>
			<Heading level={1} data-size="lg">
				Du har nå logget ut
			</Heading>
			<Paragraph>
				Klikk her for å <Link href={jiraLoginHref}>logge inn igjen</Link>
			</Paragraph>
		</Page>
	);
}
