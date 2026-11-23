import { useMsal } from "@azure/msal-react";
import { isFakeBackend } from "../../Utils/envUtils";
import {
	bekkPhotoUrl,
	employeeIdOf,
	msalInstance,
	type BekkMsal,
} from "./bekkLogin";

export interface BekkAccount {
	name: string | undefined;
	/** May 404 when the employee has no photo. Absent in fake mode. */
	photoUrl: string | undefined;
	/** Ends the Bekk session and lands on `/logout`. */
	logout: () => Promise<void>;
}

function accountFrom(instance: BekkMsal): BekkAccount {
	const account = instance.getActiveAccount();
	const employeeId = employeeIdOf(account);
	return {
		name: account?.name,
		photoUrl:
			!isFakeBackend && employeeId !== undefined
				? bekkPhotoUrl(employeeId)
				: undefined,
		logout: () =>
			instance.logoutRedirect({
				// Land on /logout (outside BekkEntraLogin) rather than "/", which would log straight back in
				postLogoutRedirectUri: `${window.location.origin}/logout`,
			}),
	};
}

const useMsalAccount = (): BekkAccount => accountFrom(useMsal().instance);

/** Fake mode renders no `MsalProvider`, so read the fake account directly. */
const useFakeAccount = (): BekkAccount => accountFrom(msalInstance);

/** The logged-in Bekk user. Use this instead of `useMsal()`. */
export const useBekkAccount = isFakeBackend ? useFakeAccount : useMsalAccount;
