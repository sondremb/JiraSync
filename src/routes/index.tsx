import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BekkEntraLogin } from "../login/bekk/example";
import { LockdateWrapper } from "../LockdateWrapper";

export const Route = createFileRoute("/")({
	component: Component,
	beforeLoad: async ({ context }) => {
		const authResult = await context.auth.getAccessToken();
		if (authResult.kind === "unauthenticated") {
			throw redirect({ to: "/login" });
		} else if (authResult.kind === "error") {
			throw redirect({ to: "/error" });
		}
	},
});

function Component() {
	return (
		<BekkEntraLogin>
			<LockdateWrapper />
		</BekkEntraLogin>
	);
}
