import React from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { LisaProvider } from "@utdanningsdirektoratet/lisa";
import { GlobalStyle } from "../global-style";
import { JiraAuthContext } from "../login/jira/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../Utils/envUtils";

export interface RouterContext {
	auth: JiraAuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<LisaProvider includeGlobalStyling>
				<GlobalStyle />
				<Outlet />
				{config.debug && <TanStackRouterDevtools position="bottom-right" />}
			</LisaProvider>
		</QueryClientProvider>
	);
}
