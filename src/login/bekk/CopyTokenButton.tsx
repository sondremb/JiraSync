import React from "react";
import { Button, useNotification } from "@utdanningsdirektoratet/lisa";
import { config } from "../../Utils/envUtils";
import { msalInstance } from "./bekkLogin";

export const CopyTokenButton = () => {
	const showNotification = useNotification();

	async function getAccessToken(): Promise<string> {
		const result = await msalInstance.acquireTokenSilent({
			scopes: [config.bekk.scope],
		});
		return result.accessToken;
	}

	function copyToken() {
		getAccessToken()
			.then((token) => {
				navigator.clipboard.writeText(token);
				showNotification({
					type: "success",
					content: "Token kopiert til utklippstavlen",
				});
			})
			.catch(() => {
				showNotification({
					type: "error",
					content: "Kunne ikke hente token",
				});
			});
	}

	return (
		<Button icon="copy" onClick={copyToken} variant="text">
			Kopier token
		</Button>
	);
};
