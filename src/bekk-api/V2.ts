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

import { TimecodeViewModelV3DTO, TimesheetViewModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class V2<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesList
	 * @request GET:/v2/timecodes
	 * @secure
	 */
	timecodesList = (
		query?: {
			/** @format int32 */
			ProjectId?: number;
			Fields?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimecodeViewModelV3DTO[], any>({
			path: `/v2/timecodes`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name TimesheetsEmployeesDetail
	 * @request GET:/v2/timesheets/employees/{employeeId}
	 * @deprecated
	 * @secure
	 */
	timesheetsEmployeesDetail = (
		employeeId: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimesheetViewModelDTO, any>({
			path: `/v2/timesheets/employees/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
