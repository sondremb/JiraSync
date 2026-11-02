import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../login/requireAuth";
import { PolicyList } from "../policy/PolicyList";
import { PolicyPage } from "../policy/PolicyPage";

export const Route = createFileRoute("/policy/all")({
	component: Component,
	beforeLoad: requireAuth,
});

function Component() {
	return (
		<PolicyPage>
			<PolicyList />
		</PolicyPage>
	);
}
