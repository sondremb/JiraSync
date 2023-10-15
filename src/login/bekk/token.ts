import { isDevelopment } from "../../Utils/envUtils";

interface Token {
	"https://api.bekk.no/claims/permission": string[];
	"https://api.bekk.no/claims/employeeId": number;
	name: string;
	groups: string[];
	iss: string;
	sub: string;
	aud: string;
	iat: number;
	exp: number;
}

function getScopes() {
	return "openid name groups";
}

function getIssuerDomain() {
	return isDevelopment() ? "bekk-dev.eu.auth0.com" : "bekk.eu.auth0.com";
}

function getAudience() {
	return import.meta.env.VITE_BEKK_CLIENT_ID;
}

function parseHash(hash: string): Record<string, string> {
	const params: Record<string, string> = {};
	const hashes = hash.replace("#", "").split("&");
	for (const h of hashes) {
		const [key, value] = h.split("=");
		params[key] = value;
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

export function getIdToken(): string | null {
	try {
		return localStorage.getItem("userToken");
	} catch (e) {
		alert(
			"Fikk ikke hentet ut userToken fra localStorage. Om du bruker safari i privat mode skru av dette for at siden skal laste :)"
		);
		return null;
	}
}

function base64ToUtf8(str: string): string {
	return decodeURIComponent(window.atob(str));
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
	if (state) {
		window.location.replace(getApplicationRoot() + state);
	}
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

export function isExpired(token: Token): boolean {
	const epochNow = Date.now() / 1_000;
	return token.exp <= epochNow - 10;
}

function parseToken(jwt: string): Token {
	const [_header, payload, _signature] = jwt.split(".");
	const jsonString = base64ToUtf8(payload);
	// TODO validation here? To ensure token matches expected schema
	return JSON.parse(jsonString);
}

export function getToken(): Token | null {
	const tokenString = getIdToken();
	if (tokenString === null) {
		return null;
	}
	return parseToken(tokenString);
}

export function getEmployeeIdFromToken() {
	if (!isAuthenticated) {
		throw new Error("Brukeren er ikke autentisert");
	}
	return parseToken(getIdToken()!)["https://api.bekk.no/claims/employeeId"];
}

export function isAuthenticated(): boolean {
	const userToken = getToken();
	if (userToken) {
		return !isExpired(userToken);
	}
	return false;
}

export function checkAuthentication(): void {
	const token = tryParseToken();
	if (token) {
		saveToken(token);
		redirectToState();
	}
}

export function authenticate(): void {
	redirectToAuth0();
}

export function getAuthorizationHeader() {
	const bearer_token = getIdToken();
	if (!bearer_token) {
		throw new Error("Brukeren er ikke autentisert");
	}
	return "Bearer " + bearer_token;
}

export function clearBekkToken() {
	localStorage.removeItem("userToken");
}
