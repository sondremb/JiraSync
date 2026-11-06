import { redirect } from "@tanstack/react-router";
import type { RouterContext } from "../routes/__root";

/** `beforeLoad` guard for routes that need a Jira session. */
export async function requireAuth({ context }: { context: RouterContext }) {
	const authResult = await context.auth.getAccessToken();
	if (authResult.kind === "unauthenticated") {
		throw redirect({ to: "/login" });
	} else if (authResult.kind === "error") {
		throw redirect({ to: "/error" });
	}
}
