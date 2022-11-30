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

import {
	CustomerTimesheetViewModelDTO,
	EmployeeTimesheetViewModelDTO,
	TimecodeTimesheetsWrapperDTO,
	TimecodeTimesheetViewModelDTO,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class V3<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name TimesheetsEmployeesDetail
	 * @request GET:/v3/timesheets/employees/{employeeId}
	 * @secure
	 */
	timesheetsEmployeesDetail = (
		employeeId: number,
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeTimesheetViewModelDTO, any>({
			path: `/v3/timesheets/employees/${employeeId}`,
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
	 * @name TimesheetsEmployeesList
	 * @request GET:/v3/timesheets/employees
	 * @secure
	 */
	timesheetsEmployeesList = (
		query: {
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
		this.request<EmployeeTimesheetViewModelDTO[], any>({
			path: `/v3/timesheets/employees`,
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
	 * @name TimesheetsCustomersDetail
	 * @request GET:/v3/timesheets/customers/{customerId}
	 * @secure
	 */
	timesheetsCustomersDetail = (
		customerId: number,
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<CustomerTimesheetViewModelDTO, any>({
			path: `/v3/timesheets/customers/${customerId}`,
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
	 * @name TimesheetsTimecodesList
	 * @request GET:/v3/timesheets/timecodes
	 * @secure
	 */
	timesheetsTimecodesList = (
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
			/** @default false */
			excludeBillable?: boolean;
			/** @default false */
			includeProject?: boolean;
			/** @format int32 */
			invoiceManagerId?: number;
			/** @format int32 */
			departmentId?: number;
			/** @format int32 */
			timecodeCategoryId?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<TimecodeTimesheetsWrapperDTO, any>({
			path: `/v3/timesheets/timecodes`,
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
	 * @name TimesheetsTimecodesDetail
	 * @request GET:/v3/timesheets/timecodes/{timecodeId}
	 * @secure
	 */
	timesheetsTimecodesDetail = (
		timecodeId: number,
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimecodeTimesheetViewModelDTO, any>({
			path: `/v3/timesheets/timecodes/${timecodeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
