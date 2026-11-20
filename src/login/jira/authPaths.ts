/**
 * The Netlify functions behind Jira login. The app, the backend and the fake
 * backend's handlers all import them from here. Keep this module free of
 * browser and Vite APIs: the Netlify functions import it too.
 */
export const jiraAuthPaths = {
	init: "/.netlify/functions/jira-auth-init",
	callback: "/.netlify/functions/jira-auth-callback",
	session: "/.netlify/functions/jira-auth-session",
	logout: "/.netlify/functions/jira-auth-logout",
} as const;
