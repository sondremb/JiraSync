import createClient, { Middleware } from "openapi-fetch";
import { paths } from "../generated/bekk-timekeeper";
import { msalInstance } from "../login/bekk/example";
import { config } from "../Utils/envUtils";

const authMiddleware: Middleware = {
	async onRequest({ request }) {
		const result = await msalInstance.acquireTokenSilent({
			scopes: [config.bekk.scope],
		});
		request.headers.set("Authorization", `Bearer ${result.accessToken}`);
		return request;
	},
};

export const bekkClient = createClient<paths>({ baseUrl: config.bekk.baseUrl });
bekkClient.use(authMiddleware);
