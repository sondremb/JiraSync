import { Brand } from "../../Utils/brandedTypes";
import { StatusCode } from "../../Utils/statuscode";

export type AccessToken = Brand<string, "AccessToken">;

type AuthenticationResult =
	| {
			kind: "authenticated";
			accessToken: AccessToken;
	  }
	| {
			kind: "unauthenticated";
	  }
	| {
			kind: "error";
	  };
const AuthenticationResult = {
	Authenticated: (accessToken: AccessToken): AuthenticationResult => ({
		kind: "authenticated",
		accessToken,
	}),
	Unauthenticated: (): AuthenticationResult => ({
		kind: "unauthenticated",
	}),
	Error: (): AuthenticationResult => ({
		kind: "error",
	}),
};

export interface JiraAuthContext {
	getAccessToken: () => Promise<AuthenticationResult>;
}

type StoredToken = {
	accessToken: AccessToken;
	expiresAt: number;
};

function getFromStorage(): StoredToken | null {
	const accessToken = localStorage.getItem(accessTokenKey);
	const expiresAtString = localStorage.getItem(expiresAtKey);
	if (!accessToken || !expiresAtString) {
		return null;
	}
	const expiresAt = parseInt(expiresAtString, 10);
	if (isNaN(expiresAt)) {
		return null;
	}
	return {
		accessToken: accessToken as AccessToken,
		expiresAt,
	};
}

function isValid(token: StoredToken): boolean {
	return token.expiresAt > Date.now();
}

async function refreshFromServer(): Promise<AuthenticationResult> {
	const response = await fetch("/.netlify/functions/jira-auth-session", {
		credentials: "include",
	});

	if (response.status === StatusCode.Unauthorized401) {
		return AuthenticationResult.Unauthenticated();
	}
	if (!response.ok) {
		return AuthenticationResult.Error();
	}
	const data = (await response.json()) as {
		accessToken: string;
		expiresIn: number;
	};
	const accessToken = data.accessToken as AccessToken;
	const expiresAt = Date.now() + data.expiresIn * 1000;

	localStorage.setItem(accessTokenKey, accessToken);
	localStorage.setItem(expiresAtKey, expiresAt.toString());

	return AuthenticationResult.Authenticated(accessToken);
}

const accessTokenKey = "atlassian_access_token";
const expiresAtKey = "atlassian_access_token_expires_at";

export const jiraAuthenticationContext: JiraAuthContext = {
	getAccessToken: async () => {
		const storedToken = getFromStorage();
		if (storedToken && isValid(storedToken)) {
			return AuthenticationResult.Authenticated(storedToken.accessToken);
		}

		return refreshFromServer();
	},
};
