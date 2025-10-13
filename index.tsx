import React from "react";
import { createRoot } from "react-dom/client";
import { LisaProvider } from "@utdanningsdirektoratet/lisa";
import { GlobalStyle } from "./src/global-style";
import { JiraLogin } from "./src/login/jira/JiraLogin";
import { BekkEntraLogin } from "./src/login/bekk/example";
import { LockdateWrapper } from "./src/LockdateWrapper";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement); // createRoot(container!) if you use TypeScript
root.render(
	<LisaProvider includeGlobalStyling>
		<GlobalStyle />
		<BekkEntraLogin>
			<JiraLogin>
				<LockdateWrapper />
			</JiraLogin>
		</BekkEntraLogin>
	</LisaProvider>
);
