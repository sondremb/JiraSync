import { useMsal } from "@azure/msal-react";
import { jiraAuthenticationContext } from "./jira/authContext";

export function useLogout() {
	const { instance } = useMsal();
	return async () => {
		// Must finish before the MSAL redirect, which would otherwise cancel the request
		// and leave the Jira refresh token cookie in place
		await jiraAuthenticationContext.logout();
		// Land on /logout (outside BekkEntraLogin) rather than "/", which would log straight back in
		await instance.logoutRedirect({
			postLogoutRedirectUri: `${window.location.origin}/logout`,
		});
	};
}
