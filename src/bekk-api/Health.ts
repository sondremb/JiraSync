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

import { HealthzResponse } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Health<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Health
	 * @name HealthList
	 * @request GET:/health
	 * @secure
	 */
	healthList = (params: RequestParams = {}) =>
		this.request<HealthzResponse, any>({
			path: `/health`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
