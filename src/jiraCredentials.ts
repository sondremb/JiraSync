export interface JiraCredentials {
	username: string;
	password: string;
}

const usernameKey = "jira_username";
const passwordKey = "jira_password";

const getFromLocalStorage = (): JiraCredentials | null => {
	const username = localStorage.getItem(usernameKey);
	const password = localStorage.getItem(passwordKey);
	if (username === null || password === null) return null;
	return {
		username,
		password,
	};
};

const setLocalStorage = (credentials: JiraCredentials): void => {
	localStorage.setItem(usernameKey, credentials.username);
	localStorage.setItem(passwordKey, credentials.password);
};

const setSessionStorage = (credentials: JiraCredentials): void => {
	sessionStorage.setItem(usernameKey, credentials.username);
	sessionStorage.setItem(passwordKey, credentials.password);
};

export const clearJiraCredentials = (): void => {
	localStorage.removeItem(usernameKey);
	localStorage.removeItem(passwordKey);
};

export const setJiraCredentials = (
	credentials: JiraCredentials,
	save: boolean
): void => {
	setSessionStorage(credentials);
	if (save) {
		setLocalStorage(credentials);
	}
};

export const getJiraCredentials = (): JiraCredentials | null => {
	const username = sessionStorage.getItem(usernameKey);
	const password = sessionStorage.getItem(passwordKey);
	if (username !== null && password !== null) {
		return { username, password };
	}

	const credentials = getFromLocalStorage();
	if (credentials !== null) {
		setLocalStorage(credentials);
		return credentials;
	}
	return null;
};
