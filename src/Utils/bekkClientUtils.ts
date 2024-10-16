import { ApiConfig, HttpClient } from "../bekk-api/http-client";
import { useGetAccessToken } from "../login/bekk/example2";
import { config } from "./envUtils";

type ClientConstructor<T extends HttpClient> = new (config: ApiConfig) => T;

export function useClient<T extends HttpClient>(
	ClientClass: ClientConstructor<T>
): T {
	const getAccessToken = useGetAccessToken();
	return new ClientClass({
		baseUrl: config.bekk.baseUrl,
		securityWorker: async () => ({
			headers: { Authorization: `Bearer ${await getAccessToken()}` },
		}),
	});
}

export function useClientFactory() {
	const getAccessToken = useGetAccessToken();
	return function create<T extends HttpClient>(
		ClientClass: ClientConstructor<T>
	): T {
		return new ClientClass({
			baseUrl: config.bekk.baseUrl,
			securityWorker: async () => {
				return {
					headers: { Authorization: `Bearer ${await getAccessToken()}` },
				};
			},
		});
	};
}
