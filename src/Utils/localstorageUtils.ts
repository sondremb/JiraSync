const usernameKey = "jira_username";
const passwordKey = "jira_password";
const userTokenKey = "userToken";

export const storeCredentials = (username: string, password: string) => {
	localStorage.setItem(usernameKey, username);
	localStorage.setItem(passwordKey, password);
};
export const loadCredentials = () => {
	return [localStorage.getItem(usernameKey), localStorage.getItem(passwordKey)];
};
export const loadUserName = () => localStorage.getItem(usernameKey);
export const loadPassword = () => localStorage.getItem(passwordKey);

export const clearCredentials = () => {
	localStorage.removeItem(usernameKey);
	localStorage.removeItem(passwordKey);
};

export const storeUserToken = (token: string) => {
	localStorage.setItem(userTokenKey, token);
};
