import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./src/routeTree.gen";
import { jiraAuthenticationContext } from "./src/login/jira/authContext";
import { isFakeBackend } from "./src/Utils/envUtils";
import "@digdir/designsystemet-css";
import "@digdir/designsystemet-css/theme.css";
import "./src/global.css";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: {
		auth: jiraAuthenticationContext,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const render = () => {
	const container = document.getElementById("root");
	const root = createRoot(container as HTMLElement);
	root.render(<RouterProvider router={router} />);
};

if (isFakeBackend) {
	// Dev only: the fake backend must answer before the first request. Behind
	// the flag, so `pnpm build` drops it and everything it imports.
	import("./src/fake/browser")
		.then(({ startFakeBackend }) => startFakeBackend())
		.then(render, (error: unknown) => {
			console.error(error);
			document.body.textContent = `The fake backend failed to start: ${String(error)}`;
		});
} else {
	render();
}
