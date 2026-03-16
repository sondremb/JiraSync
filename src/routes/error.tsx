import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Noe gikk galt 😢</div>;
}
