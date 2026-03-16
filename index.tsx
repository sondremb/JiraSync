import React from "react";
import { createRoot } from "react-dom/client";
import { LisaProvider } from "@utdanningsdirektoratet/lisa";
import { GlobalStyle } from "./src/global-style";
import { BekkEntraLogin } from "./src/login/bekk/example";
import { LockdateWrapper } from "./src/LockdateWrapper";
import { NewJiraLogin } from "./src/login/jira/NewJiraLogin";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement); // createRoot(container!) if you use TypeScript
root.render(
	<LisaProvider includeGlobalStyling>
		<GlobalStyle />
		<BekkEntraLogin>
			<NewJiraLogin>
				<LockdateWrapper />
			</NewJiraLogin>
		</BekkEntraLogin>
	</LisaProvider>,
);
