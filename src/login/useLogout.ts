import { jiraAuthenticationContext } from "./jira/authContext";
import { useBekkAccount } from "./bekk/useBekkAccount";

export function useLogout() {
	const { logout: logoutBekk } = useBekkAccount();
	return async () => {
		// Must finish before the MSAL redirect, which would otherwise cancel the request
		// and leave the Jira refresh token cookie in place
		await jiraAuthenticationContext.logout();
		await logoutBekk();
	};
}
