import { getAuthorizationHeader } from "../auth";
import { ApiConfig, HttpClient } from "../bekk-api/http-client";
import { BASE_URL } from "../bekk-client";

export const createClient = <T extends HttpClient>(
	Client: new (config: ApiConfig) => T
): T =>
	new Client({
		baseUrl: BASE_URL,
		baseApiParams: { headers: { authorization: getAuthorizationHeader() } },
	});
