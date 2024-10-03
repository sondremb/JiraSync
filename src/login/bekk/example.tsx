import {
	PublicClientApplication,
	BrowserCacheLocation,
	AuthenticationResult,
	EventType,
	InteractionType,
} from "@azure/msal-browser";
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import React from "react";

const tenantId = "lol";
const clientId = "nope";
const scope = "sekurity 🧠";

// Konfigurer og opprett MSAL-instans
export const msalInstance = new PublicClientApplication({
	auth: {
		clientId,
		authority: `https://login.microsoftonline.com/${tenantId}`,
	},
	cache: {
		cacheLocation: BrowserCacheLocation.LocalStorage,
	},
});

export const BekkEntraLogin = ({ children }: React.PropsWithChildren<{}>) => {
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
		scopes: [scope],
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
