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

import { TimecodeAccessViewModel, TimecodeEssentials, TimecodeViewModel } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Timecodeaccesses<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags TimecodeAccess
	 * @name TimecodeaccessesList
	 * @request GET:/timecodeaccesses
	 * @secure
	 */
	timecodeaccessesList = (params: RequestParams = {}) =>
		this.request<TimecodeAccessViewModel[], any>({
			path: `/timecodeaccesses`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags TimecodeAccess
	 * @name EmployeeDetail
	 * @request GET:/timecodeaccesses/employee/{employeeId}
	 * @secure
	 */
	employeeDetail = (
		employeeId: number,
		query?: {
			standardAccount?: boolean;
		},
		params: RequestParams = {},
	) =>
		this.request<TimecodeEssentials[], any>({
			path: `/timecodeaccesses/employee/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags TimecodeAccess
	 * @name EmployeeUpdate
	 * @request PUT:/timecodeaccesses/employee/{employeeId}
	 * @secure
	 */
	employeeUpdate = (employeeId: number, data: number[], params: RequestParams = {}) =>
		this.request<TimecodeViewModel[], any>({
			path: `/timecodeaccesses/employee/${employeeId}`,
			method: "PUT",
			body: data,
			secure: true,
			type: ContentType.Json,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags TimecodeAccess
	 * @name TimecodeUpdate
	 * @request PUT:/timecodeaccesses/timecode/{timecodeId}
	 * @secure
	 */
	timecodeUpdate = (timecodeId: number, data: number[], params: RequestParams = {}) =>
		this.request<number[], any>({
			path: `/timecodeaccesses/timecode/${timecodeId}`,
			method: "PUT",
			body: data,
			secure: true,
			type: ContentType.Json,
			format: "json",
			...params,
		});
}
