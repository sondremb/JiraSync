import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@utdanningsdirektoratet/lisa";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Link url=".netlify/functions/jira-auth-init">Logg inn i Jira 2</Link>;
}
