import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import "moment/dist/locale/nb";
import { LisaProvider } from "@udir/lisa";
import { ErrorStore } from "./src/errorstore/store";
import { ErrorModal } from "./src/errorstore/error-modal";
import { GlobalStyle } from "./src/global-style";
import { BekkLogin } from "./src/login/bekk/BekkLogin";
import { App } from "./src/App";
import { JiraLogin } from "./src/login/jira/JiraLogin";

moment.locale("nb");

ReactDOM.render(
	<ErrorStore>
		<LisaProvider includeGlobalStyling>
			<GlobalStyle />
			<ErrorModal />
			<BekkLogin>
				<JiraLogin>
					<App />
				</JiraLogin>
			</BekkLogin>
		</LisaProvider>
	</ErrorStore>,
	document.getElementById("root")
);
