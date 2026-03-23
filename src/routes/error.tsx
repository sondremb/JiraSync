import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { P } from "../components/P";
import { Link } from "@utdanningsdirektoratet/lisa";
import { Link as RouterLink } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			Noe gikk galt 😢
			<P>
				Kanskje det hjelper å{" "}
				<Link reactRouterLink={RouterLink} url={"/logout"}>
					Logge ut?
				</Link>
			</P>
		</div>
	);
}
