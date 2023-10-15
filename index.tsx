import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import "moment/dist/locale/nb";
import { LisaProvider } from "@udir/lisa";
import { GlobalStyle } from "./src/global-style";
import { BekkLogin } from "./src/login/bekk/BekkLogin";
import { App } from "./src/App";
import { JiraLogin } from "./src/login/jira/JiraLogin";

moment.locale("nb");

ReactDOM.render(
	<LisaProvider includeGlobalStyling>
		<GlobalStyle />
		<BekkLogin>
			<JiraLogin>
				<App />
			</JiraLogin>
		</BekkLogin>
	</LisaProvider>,
	document.getElementById("root")
);
