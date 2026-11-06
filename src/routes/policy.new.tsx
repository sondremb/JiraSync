import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "../login/requireAuth";
import { PolicyEditor } from "../policy/PolicyEditor";
import { PolicyPage } from "../policy/PolicyPage";

export const Route = createFileRoute("/policy/new")({
	component: Component,
	beforeLoad: requireAuth,
	/** `from`: id of the ruleset to start a copy from. */
	validateSearch: (search: Record<string, unknown>): { from?: string } =>
		typeof search.from === "string" ? { from: search.from } : {},
});

function Component() {
	const { from } = Route.useSearch();
	return (
		<PolicyPage>
			<PolicyEditor sourceId={from} mode="new" />
		</PolicyPage>
	);
}
