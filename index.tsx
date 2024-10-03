import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import "moment/dist/locale/nb";
import { LisaProvider } from "@udir/lisa";
import { GlobalStyle } from "./src/global-style";
import { App } from "./src/App";
import { JiraLogin } from "./src/login/jira/JiraLogin";
import { BekkEntraLogin } from "./src/login/bekk/example";

moment.locale("nb");

ReactDOM.render(
	<LisaProvider includeGlobalStyling>
		<GlobalStyle />
		<BekkEntraLogin>
			<JiraLogin>
				<App />
			</JiraLogin>
		</BekkEntraLogin>
	</LisaProvider>,
	document.getElementById("root")
);
