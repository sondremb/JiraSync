import React from "react";
import { createRoot } from "react-dom/client";
import { LisaProvider } from "@utdanningsdirektoratet/lisa";
import { GlobalStyle } from "./src/global-style";
import { App } from "./src/App";
import { JiraLogin } from "./src/login/jira/JiraLogin";
import { BekkEntraLogin } from "./src/login/bekk/example";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement); // createRoot(container!) if you use TypeScript
root.render(
	<LisaProvider includeGlobalStyling>
		<GlobalStyle />
		<BekkEntraLogin>
			<JiraLogin>
				<App />
			</JiraLogin>
		</BekkEntraLogin>
	</LisaProvider>
);
