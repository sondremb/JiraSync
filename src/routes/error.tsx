import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Paragraph } from "@digdir/designsystemet-react";
import { Link } from "@utdanningsdirektoratet/lisa";
import { Link as RouterLink } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			Noe gikk galt 😢
			<Paragraph>
				Kanskje det hjelper å{" "}
				<Link reactRouterLink={RouterLink} url={"/logout"}>
					Logge ut?
				</Link>
			</Paragraph>
		</div>
	);
}
