import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BekkEntraLogin } from "../login/bekk/bekkLogin";
import { LockdateWrapper } from "../LockdateWrapper";
import { requireAuth } from "../login/requireAuth";

export const Route = createFileRoute("/")({
	component: Component,
	beforeLoad: requireAuth,
});

function Component() {
	return (
		<BekkEntraLogin>
			<LockdateWrapper />
		</BekkEntraLogin>
	);
}
