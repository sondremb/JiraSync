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

export function useEmployeeId(): number {
	const msalContext = useMsal();

	const idTokenClaims =
		msalContext.instance.getActiveAccount()?.idTokenClaims ?? {};
	const employeeId = idTokenClaims["employeeId"] as string;

	if (!employeeId) {
		throw new Error("No employee ID found!");
	}

	return parseInt(employeeId);
}
