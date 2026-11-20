import {
	PublicClientApplication,
	BrowserCacheLocation,
	AuthenticationResult,
	EventType,
	InteractionType,
	type IPublicClientApplication,
} from "@azure/msal-browser";
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import React from "react";
import { config, isFakeBackend } from "../../Utils/envUtils";
import { createFakeMsal } from "../../fake/fakeMsal";

/** The part of MSAL the app uses outside `BekkEntraLogin`. */
export type BekkMsal = Pick<
	IPublicClientApplication,
	"getActiveAccount" | "acquireTokenSilent" | "logoutRedirect"
>;

// Konfigurer og opprett MSAL-instans. I fake mode lages den aldri, så vi
// aldri sendes til Microsoft.
export const msalInstance: BekkMsal = isFakeBackend
	? createFakeMsal()
	: new PublicClientApplication({
			auth: {
				clientId: config.bekk.clientId,
				authority: `https://login.microsoftonline.com/${config.bekk.tenantId}`,
			},
			cache: {
				cacheLocation: BrowserCacheLocation.LocalStorage,
			},
		});

export function getEmployeeId(): number {
	const idTokenClaims = msalInstance.getActiveAccount()?.idTokenClaims ?? {};
	const employeeId = idTokenClaims["employeeId"] as string;
	if (!employeeId) {
		throw new Error("No employee ID found!");
	}
	return parseInt(employeeId);
}

export const BekkEntraLogin = ({ children }: React.PropsWithChildren<{}>) => {
	if (isFakeBackend) {
		return <>{children}</>;
	}
	return (
		<MsalLogin instance={msalInstance as PublicClientApplication}>
			{children}
		</MsalLogin>
	);
};

// Takes the real instance as a prop so the body below can keep using MSAL's full API.
const MsalLogin = ({
	instance: msalInstance,
	children,
}: React.PropsWithChildren<{ instance: PublicClientApplication }>) => {
	// Initialiser instansen (dette bør gjøres så tidlig som mulig)
	msalInstance.initialize().then(() => {
		// Sett aktiv konto dersom den finnes, men ikke enda er satt
		if (
			!msalInstance.getActiveAccount() &&
			msalInstance.getAllAccounts().length > 0
		) {
			msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
		}

		// Sett aktiv konto umiddelbart etter suksessfull autentisering
		msalInstance.addEventCallback((event) => {
			const account = (event.payload as AuthenticationResult)?.account;
			if (event.eventType === EventType.LOGIN_SUCCESS && account) {
				msalInstance.setActiveAccount(account);
			}
		});
	});

	// Scope er kun nødvendig dersom appen prater med Bekk-apier
	const authRequest = {
		scopes: [config.bekk.scope, "openid", "profile"],
	};

	return (
		<MsalProvider instance={msalInstance}>
			{/* Denne håndterer automatisk redirect til innlogging 
        dersom brukeren ikke er innlogget/må reautentisere seg */}
			<MsalAuthenticationTemplate
				interactionType={InteractionType.Redirect}
				authenticationRequest={authRequest}
			>
				{children}
			</MsalAuthenticationTemplate>
		</MsalProvider>
	);
};
