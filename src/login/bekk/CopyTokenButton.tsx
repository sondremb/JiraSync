import React from "react";
import { useGetAccessToken } from "./example2";
import { Button, useNotification } from "@utdanningsdirektoratet/lisa";

export const CopyTokenButton = () => {
	const getAccessToken = useGetAccessToken();
	const showNotification = useNotification();

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
