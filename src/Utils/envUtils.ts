export const config = {
	bekk: {
		baseUrl: getConfigValue("VITE_BEKK_BASE_URL"),
		tenantId: getConfigValue("VITE_BEKK_ENTRA_TENANT_ID"),
		clientId: getConfigValue("VITE_BEKK_ENTRA_CLIENT_ID"),
		scope: getConfigValue("VITE_BEKK_ENTRA_SCOPE"),
	},
};

function getConfigValue(key: string): string {
	const value = import.meta.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
