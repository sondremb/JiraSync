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
		return { accessToken: authResult.accessToken };
	},
	loader: ({ context }) => {
		return { accessToken: context.accessToken };
	},
});

function Component() {
	const { accessToken } = Route.useLoaderData();
	console.log("Access token in root route:", accessToken);

	return (
		<BekkEntraLogin>
			<LockdateWrapper />
		</BekkEntraLogin>
	);
}
