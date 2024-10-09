import { useMsal } from "@azure/msal-react";
import { scope } from "./example";

// Hente access token for prating med Bekk-apier
export const useGetAccessToken = (): (() => Promise<string>) => {
	const msalContext = useMsal();
	return () =>
		msalContext.instance
			.acquireTokenSilent({ scopes: [scope] })
			.then((res) => res.accessToken);
};

// Hente access token for prating med Bekk-apier
export const useAccessToken = (): Promise<string> => {
	const msalContext = useMsal();
	return msalContext.instance
		.acquireTokenSilent({ scopes: [scope] })
		.then((res) => res.accessToken);
};
