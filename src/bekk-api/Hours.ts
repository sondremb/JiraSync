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

import { SumOfHoursProjectDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Hours<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name ProjectsSumList
	 * @request GET:/hours/projects/sum
	 * @secure
	 */
	projectsSumList = (
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<SumOfHoursProjectDTO[], any>({
			path: `/hours/projects/sum`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
