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

import { HttpClient, RequestParams } from "./http-client";

export class Lunchdeductions<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags LunchDeduction
	 * @name LunchdeductionsList
	 * @request GET:/lunchdeductions
	 * @secure
	 */
	lunchdeductionsList = (
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<void, any>({
			path: `/lunchdeductions`,
			method: "GET",
			query: query,
			secure: true,
			...params,
		});
}
