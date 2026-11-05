import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../login/requireAuth";
import { PolicyEditor } from "../policy/PolicyEditor";
import { PolicyPage } from "../policy/PolicyPage";

export const Route = createFileRoute("/policy/$id/edit")({
	component: Component,
	beforeLoad: requireAuth,
});

function Component() {
	const { id } = Route.useParams();
	return (
		<PolicyPage>
			<PolicyEditor sourceId={id} mode="edit" />
		</PolicyPage>
	);
}
