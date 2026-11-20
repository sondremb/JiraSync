import type { AccountInfo, AuthenticationResult } from "@azure/msal-browser";
import type { BekkMsal } from "../login/bekk/bekkLogin";
import { fakeBekkAccount } from "./fakeAccount";

export const fakeBekkAccessToken = "fake-bekk-access-token";

const account: AccountInfo = {
	homeAccountId: "fake-home-account",
	environment: "fake",
	tenantId: "fake",
	username: fakeBekkAccount.username,
	localAccountId: "fake-local-account",
	name: fakeBekkAccount.name,
	idTokenClaims: { employeeId: String(fakeBekkAccount.employeeId) },
};

/** Stands in for MSAL in fake mode: always logged in, never redirects to Microsoft. */
export function createFakeMsal(): BekkMsal {
	return {
		getActiveAccount: () => account,
		acquireTokenSilent: async () =>
			({ accessToken: fakeBekkAccessToken, account }) as AuthenticationResult,
		logoutRedirect: async (request) => {
			window.location.assign(request?.postLogoutRedirectUri ?? "/");
		},
	};
}
