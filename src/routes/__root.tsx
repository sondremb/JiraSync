import React from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { LisaProvider } from "@utdanningsdirektoratet/lisa";
import { GlobalStyle } from "../global-style";
import { JiraAuthContext } from "../login/jira/authContext";

export interface RouterContext {
	auth: JiraAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<LisaProvider includeGlobalStyling>
			<GlobalStyle />
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
		</LisaProvider>
	);
}
