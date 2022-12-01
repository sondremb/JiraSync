import React from "react";
import ReactDOM from "react-dom";
import { App } from "./src/App";
import { authenticate, isAuthenticated } from "./src/auth";
import moment from "moment";
import "moment/dist/locale/nb";
import { LisaProvider } from "@udir/lisa";
import { ErrorStore } from "./src/errorstore/store";
import { ErrorModal } from "./src/errorstore/error-modal";
import { GlobalStyle } from "./src/global-style";

moment.locale("nb");

if (!isAuthenticated()) {
	authenticate();
}
ReactDOM.render(
	<ErrorStore>
		<LisaProvider includeGlobalStyling>
			<GlobalStyle />
			<ErrorModal />
			<App />
		</LisaProvider>
	</ErrorStore>,
	document.getElementById("root")
);
