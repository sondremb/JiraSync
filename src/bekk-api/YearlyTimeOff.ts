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

import { YearlyTimeOffModelViewModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class YearlyTimeOff<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags YearlyTimeOff
	 * @name EmployeesList
	 * @request GET:/yearly-time-off/employees
	 * @secure
	 */
	employeesList = (
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<YearlyTimeOffModelViewModel[], any>({
			path: `/yearly-time-off/employees`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags YearlyTimeOff
	 * @name EmployeesDetail
	 * @request GET:/yearly-time-off/employees/{employeeId}
	 * @secure
	 */
	employeesDetail = (
		employeeId: number,
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<YearlyTimeOffModelViewModel, any>({
			path: `/yearly-time-off/employees/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
