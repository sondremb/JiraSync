import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Heading } from "@digdir/designsystemet-react";
import emptyStateImg from "../../assets/svg/emptystate.svg";
import { Page } from "../layout/Page";
import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Page>
			<Heading level={1} data-size="xl">
				Velkommen til JiraSync!
			</Heading>
			<div className={styles.login}>
				<img
					className={styles.login__illustration}
					src={emptyStateImg}
					alt=""
				/>
				<Button asChild>
					<a href=".netlify/functions/jira-auth-init">Logg inn</a>
				</Button>
			</div>
		</Page>
	);
}
