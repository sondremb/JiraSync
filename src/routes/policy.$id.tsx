import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../login/requireAuth";
import { PolicyDetail } from "../policy/PolicyDetail";
import { PolicyPage } from "../policy/PolicyPage";

export const Route = createFileRoute("/policy/$id")({
	component: Component,
	beforeLoad: requireAuth,
});

function Component() {
	const { id } = Route.useParams();
	return (
		<PolicyPage>
			<PolicyDetail id={id} />
		</PolicyPage>
	);
}
