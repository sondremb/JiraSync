import React from "react";
import ReactDOM from "react-dom";
import { App } from "./src/App";
import { authenticate, isAuthenticated } from "./src/Timekeeper/auth";
import moment from "moment";
import "moment/locale/nb";
import { LisaProvider } from "@udir/lisa";
import "dotenv/config";
import { Store } from "./src/store/store";
import { ErrorStore } from "./src/errorstore/store";
import { ErrorModal } from "./src/errorstore/error-modal";

moment.locale("nb");

if (!isAuthenticated()) {
	if (process.env.ENV !== "DEV") {
		authenticate();
	}
}
ReactDOM.render(
	<ErrorStore>
		<Store>
			<LisaProvider includeGlobalStyling>
				<ErrorModal />
				<App />
			</LisaProvider>
		</Store>
	</ErrorStore>,
	document.getElementById("root")
);
