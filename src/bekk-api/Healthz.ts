/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { Healthz } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Healthz<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Health
	 * @name HealthzList
	 * @request GET:/healthz
	 * @secure
	 */
	healthzList = (params: RequestParams = {}) =>
		this.request<Healthz, any>({
			path: `/healthz`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
