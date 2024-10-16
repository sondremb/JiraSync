import {
	PublicClientApplication,
	BrowserCacheLocation,
	AuthenticationResult,
	EventType,
	InteractionType,
} from "@azure/msal-browser";
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import React from "react";
import { config } from "../../Utils/envUtils";

// Konfigurer og opprett MSAL-instans
export const msalInstance = new PublicClientApplication({
	auth: {
		clientId: config.bekk.clientId,
		authority: `https://login.microsoftonline.com/${config.bekk.tenantId}`,
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
		scopes: [config.bekk.scope],
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
