import React from "react";
import ReactDOM from "react-dom";
import { App } from "./src/App";
import { authenticate, isAuthenticated } from "./src/Timekeeper/auth";
import moment from "moment";
import "moment/locale/nb";
import { LisaProvider } from "@udir/lisa";
import "dotenv/config";

moment.locale("nb");

if (!isAuthenticated()) {
	if (process.env.ENV === "DEV") {
		alert("Bruk fake bekk auth");
	} else {
		authenticate();
	}
}
ReactDOM.render(
	<LisaProvider includeGlobalStyling>
		<App />
	</LisaProvider>,
	document.getElementById("root")
);
