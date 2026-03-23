import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { jiraAuthenticationContext } from "../login/jira/authContext";
import { P } from "../components/P";
import { Link } from "@utdanningsdirektoratet/lisa";

export const Route = createFileRoute("/logout")({
	component: RouteComponent,
	loader: async () => {
		await jiraAuthenticationContext.logout();
	},
});

function RouteComponent() {
	return (
		<div>
			Du har nå logget ut.
			<P>
				Klikk her for å{" "}
				<Link url=".netlify/functions/jira-auth-init">logge inn igjen</Link>
			</P>
		</div>
	);
}
