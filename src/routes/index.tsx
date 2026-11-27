import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { App } from "../App";
import { BekkEntraLogin } from "../login/bekk/bekkLogin";
import { requireAuth } from "../login/requireAuth";

export const Route = createFileRoute("/")({
	component: Component,
	beforeLoad: requireAuth,
});

function Component() {
	return (
		<BekkEntraLogin>
			<App />
		</BekkEntraLogin>
	);
}
