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
	/** Drops the cached access token so the next getAccessToken() refreshes it. */
	invalidate: () => void;
	logout: () => void;
}

type StoredToken = {
	accessToken: AccessToken;
	expiresAt: number;
};

function getFromStorage(): StoredToken | null {
	const accessToken = sessionStorage.getItem(accessTokenKey);
	const expiresAtString = sessionStorage.getItem(expiresAtKey);
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

// Refresh slightly early so a token doesn't expire while the request is in flight
const expiryMarginMs = 60_000;

function isValid(token: StoredToken): boolean {
	return token.expiresAt > Date.now() + expiryMarginMs;
}

// Refresh tokens rotate, so parallel refreshes would invalidate each other
let inflightRefresh: Promise<AuthenticationResult> | null = null;

function refreshFromServerOnce(): Promise<AuthenticationResult> {
	inflightRefresh ??= refreshFromServer().finally(() => {
		inflightRefresh = null;
	});
	return inflightRefresh;
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

	sessionStorage.setItem(accessTokenKey, accessToken);
	sessionStorage.setItem(expiresAtKey, expiresAt.toString());

	return AuthenticationResult.Authenticated(accessToken);
}

function clearStorage() {
	sessionStorage.removeItem(accessTokenKey);
	sessionStorage.removeItem(expiresAtKey);
}

const accessTokenKey = "atlassian_access_token";
const expiresAtKey = "atlassian_access_token_expires_at";

// TODO - trenger dette egentlig være en context? Spør AI
export const jiraAuthenticationContext: JiraAuthContext = {
	getAccessToken: async () => {
		const storedToken = getFromStorage();
		if (storedToken && isValid(storedToken)) {
			return AuthenticationResult.Authenticated(storedToken.accessToken);
		}

		return refreshFromServerOnce();
	},
	invalidate: clearStorage,
	logout: async () => {
		clearStorage();
		await fetch("/.netlify/functions/jira-auth-logout", {
			method: "POST",
			credentials: "include",
		});
	},
};
