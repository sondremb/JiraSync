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

import { OvertimeTimeViewModel } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Overtime<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Overtime
	 * @name EmployeesList
	 * @request GET:/overtime/employees
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
		this.request<OvertimeTimeViewModel[], any>({
			path: `/overtime/employees`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Overtime
	 * @name EmployeesDetail
	 * @request GET:/overtime/employees/{employeeId}
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
		this.request<OvertimeTimeViewModel, any>({
			path: `/overtime/employees/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
