import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./src/routeTree.gen";
import { jiraAuthenticationContext } from "./src/login/jira/authContext";

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

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);
root.render(<RouterProvider router={router} />);
