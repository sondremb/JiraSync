import { isDevelopment } from "./Utils/envUtils";

function getScopes() {
	return "openid name groups";
}

function getIssuerDomain() {
	return isDevelopment() ? "bekk-dev.eu.auth0.com" : "bekk.eu.auth0.com";
}

function getAudience() {
	return import.meta.env.VITE_BEKK_CLIENT_ID;
}

function parseHash(hash: string): any {
	// tslint:disable-next-line:no-any
	const params: any = {};
	const hashes = hash.replace("#", "").split("&");
	for (const h of hashes) {
		const param = h.split("=");
		params[param[0]] = param[1];
	}
	return params;
}

function saveToken(token: string): void {
	try {
		localStorage.setItem("userToken", token);
	} catch (e) {
		alert(
			"Fikk ikke hentet ut userToken fra localStorage. Om du bruker safari i privat mode skru av dette for at siden skal laste :)"
		);
	}
}

export function getIdToken(): string {
	try {
		return localStorage.getItem("userToken") || "";
	} catch (e) {
		alert(
			"Fikk ikke hentet ut userToken fra localStorage. Om du bruker safari i privat mode skru av dette for at siden skal laste :)"
		);
		return "";
	}
}

function base64ToUtf8(str: string): string {
	return decodeURIComponent(window.atob(str));
}

function getClaimsFromToken(jwt: string): any {
	const encoded = jwt && jwt.split(".")[1];
	const jsonString = base64ToUtf8(encoded);
	return JSON.parse(jsonString);
}

function getApplicationRoot(): string {
	return window.location.origin;
}

function getCurrentState(): string {
	const state = window.location.href.replace(getApplicationRoot(), "");
	return encodeURIComponent(state);
}

function getAuth0Url(): string {
	const encodedCallback = encodeURIComponent(getApplicationRoot());
	const state = getCurrentState();
	const encodedScopes = encodeURIComponent(getScopes());
	return `https://${getIssuerDomain()}/authorize?client_id=${getAudience()}&response_type=token&redirect_uri=${encodedCallback}&scope=${encodedScopes}&state=${state}`;
}

function redirectToAuth0(): void {
	const url = getAuth0Url();
	window.location.replace(url);
}

function getStateFromHash(): string {
	const parameters = parseHash(window.location.hash);
	return decodeURIComponent(parameters.state);
}

function redirectToState(): void {
	const state = getStateFromHash();
	window.location.replace(getApplicationRoot() + state);
}

function hashIsPresent(): boolean {
	return !!window.location.hash;
}

function tryParseToken(): string | null {
	if (hashIsPresent()) {
		const parameters = parseHash(window.location.hash);
		return parameters.id_token;
	}
	return null;
}

export function isExpired(jwt: string): boolean {
	const claims = getClaimsFromToken(jwt);
	const epochNow = new Date().getTime() / 1000;
	return claims.exp <= epochNow - 10;
}

function parseToken(jwt: string) {
	const encoded = jwt && jwt.split(".")[1];
	const jsonString = base64ToUtf8(encoded);
	return JSON.parse(jsonString);
}

export function getEmployeeIdFromToken() {
	if (!isAuthenticated) {
		throw new Error("Brukeren er ikke autentisert");
	}
	return parseToken(getIdToken())["https://api.bekk.no/claims/employeeId"];
}

export function isAuthenticated(): boolean {
	const userToken = getIdToken();
	if (userToken) {
		return !isExpired(userToken);
	}
	return false;
}

export function authenticate(): void {
	const token = tryParseToken();
	if (token) {
		saveToken(token);
		redirectToState();
	} else {
		redirectToAuth0();
	}
}

export function getAuthorizationHeader() {
	const bearer_token = getIdToken();
	if (!bearer_token) {
		throw new Error("Brukeren er ikke autentisert");
	}
	return "Bearer " + bearer_token;
}
