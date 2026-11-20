import React from "react";
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { Page } from "../layout/Page";

export const Route = createFileRoute("/error")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Page>
			<Heading level={1} data-size="lg">
				Noe gikk galt 😢
			</Heading>
			<Paragraph>
				Kanskje det hjelper å{" "}
				<Link asChild>
					<RouterLink to="/logout">logge ut?</RouterLink>
				</Link>
			</Paragraph>
		</Page>
	);
}
