/**
 * Local development against the fake backend (`src/fake/`). `import.meta.env.DEV`
 * is false in `pnpm build`, so production can never turn it on, and code behind
 * this flag is removed from the bundle.
 */
export const isFakeBackend =
	import.meta.env.DEV && import.meta.env.VITE_FAKE_BACKEND === "true";

/** Used in fake mode for variables missing from `.env`, so a fresh clone needs none. */
const fakePlaceholders: Record<string, string> = {
	VITE_BEKK_BASE_URL: "https://timekeeper.fake.invalid",
	VITE_BEKK_ENTRA_TENANT_ID: "fake-tenant",
	VITE_BEKK_ENTRA_CLIENT_ID: "fake-client",
	VITE_BEKK_ENTRA_SCOPE: "api://fake/scope",
	VITE_ATLASSIAN_CLOUD_ID: "fake-cloud",
};

export const config = {
	bekk: {
		baseUrl: getConfigValue("VITE_BEKK_BASE_URL"),
		tenantId: getConfigValue("VITE_BEKK_ENTRA_TENANT_ID"),
		clientId: getConfigValue("VITE_BEKK_ENTRA_CLIENT_ID"),
		scope: getConfigValue("VITE_BEKK_ENTRA_SCOPE"),
	},
	jira: {
		cloudId: getConfigValue("VITE_ATLASSIAN_CLOUD_ID"),
	},
	debug: import.meta.env["VITE_DEBUG"]?.toLowerCase() === "true",
};

function getConfigValue(key: string): string {
	const value =
		import.meta.env[key] || (isFakeBackend ? fakePlaceholders[key] : undefined);
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
