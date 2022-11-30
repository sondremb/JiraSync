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

import { TimeEntryViewModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Timeentries<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags TimeEntries
	 * @name TimeentriesList
	 * @request GET:/timeentries
	 * @secure
	 */
	timeentriesList = (
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
			/** @format int32 */
			timecodeId?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<TimeEntryViewModelDTO[], any>({
			path: `/timeentries`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
