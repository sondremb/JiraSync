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

import { EmployeeTimesheetViewModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class V4<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name TimesheetsEmployeesList
	 * @request GET:/v4/timesheets/employees
	 * @secure
	 */
	timesheetsEmployeesList = (
		query: {
			/** @format int32 */
			TimecodeId?: number;
			/** @format int32 */
			CustomerId?: number;
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
			/** @format int32 */
			DepartmentId?: number;
			/** @format int32 */
			DivisionId?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeTimesheetViewModel[], any>({
			path: `/v4/timesheets/employees`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
