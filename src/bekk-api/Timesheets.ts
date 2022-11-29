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
	TimeEntryViewModel,
	TimeEntryWriteModel,
	TimesheetLockDateViewModel,
	TimesheetLockViewModel,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Timesheets<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name TimeentriesUpdate
	 * @request PUT:/timesheets/timeentries/{employeeId}
	 * @deprecated
	 * @secure
	 */
	timeentriesUpdate = (employeeId: number, data: TimeEntryWriteModel[], params: RequestParams = {}) =>
		this.request<void, any>({
			path: `/timesheets/timeentries/${employeeId}`,
			method: "PUT",
			body: data,
			secure: true,
			type: ContentType.Json,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name EmployeeUpdate
	 * @request PUT:/timesheets/employee/{employeeId}
	 * @secure
	 */
	employeeUpdate = (employeeId: number, data: TimeEntryWriteModel, params: RequestParams = {}) =>
		this.request<TimeEntryViewModel, any>({
			path: `/timesheets/employee/${employeeId}`,
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
	 * @tags Timesheets
	 * @name EmployeeDelete
	 * @request DELETE:/timesheets/employee/{employeeId}
	 * @secure
	 */
	employeeDelete = (employeeId: number, data: TimeEntryWriteModel, params: RequestParams = {}) =>
		this.request<void, any>({
			path: `/timesheets/employee/${employeeId}`,
			method: "DELETE",
			body: data,
			secure: true,
			type: ContentType.Json,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name LockhoursUpdate
	 * @request PUT:/timesheets/lockhours
	 * @secure
	 */
	lockhoursUpdate = (
		query?: {
			/** @format int32 */
			employeeId?: number;
			/** @format date-time */
			lockDate?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimesheetLockDateViewModel, any>({
			path: `/timesheets/lockhours`,
			method: "PUT",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name LockNotStartedUpdate
	 * @request PUT:/timesheets/lock-not-started
	 * @secure
	 */
	lockNotStartedUpdate = (
		query?: {
			/** @format date-time */
			maxDate?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<void, any>({
			path: `/timesheets/lock-not-started`,
			method: "PUT",
			query: query,
			secure: true,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name LockdatesList
	 * @request GET:/timesheets/lockdates
	 * @secure
	 */
	lockdatesList = (
		query?: {
			/** @default false */
			includeResignedAndNotStartedEmployees?: boolean;
		},
		params: RequestParams = {},
	) =>
		this.request<TimesheetLockViewModel[], any>({
			path: `/timesheets/lockdates`,
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
	 * @name LockdatesDetail
	 * @request GET:/timesheets/lockdates/{employeeId}
	 * @secure
	 */
	lockdatesDetail = (employeeId: number, params: RequestParams = {}) =>
		this.request<TimesheetLockViewModel, any>({
			path: `/timesheets/lockdates/${employeeId}`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name LockdateDetail
	 * @request GET:/timesheets/lockdate/{employeeId}
	 * @deprecated
	 * @secure
	 */
	lockdateDetail = (employeeId: number, params: RequestParams = {}) =>
		this.request<TimesheetLockViewModel, any>({
			path: `/timesheets/lockdate/${employeeId}`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name CustomersDetail
	 * @request GET:/timesheets/customers/{customerId}
	 * @deprecated
	 * @secure
	 */
	customersDetail = (
		customerId: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimeEntryViewModel[], any>({
			path: `/timesheets/customers/${customerId}`,
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
	 * @name EmployeesDetail
	 * @request GET:/timesheets/employees/{employeeId}
	 * @deprecated
	 * @secure
	 */
	employeesDetail = (
		employeeId: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimeEntryViewModel[], any>({
			path: `/timesheets/employees/${employeeId}`,
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
	 * @name ProjectsDetail
	 * @request GET:/timesheets/projects/{projectId}
	 * @deprecated
	 * @secure
	 */
	projectsDetail = (
		projectId: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimeEntryViewModel[], any>({
			path: `/timesheets/projects/${projectId}`,
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
	 * @name GetTimesheets
	 * @request GET:/timesheets/me
	 * @deprecated
	 * @secure
	 */
	getTimesheets = (
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimeEntryViewModel[], any>({
			path: `/timesheets/me`,
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
	 * @name OvertimeDetail
	 * @request GET:/timesheets/overtime/{employeeId}
	 * @secure
	 */
	overtimeDetail = (
		employeeId: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<number, any>({
			path: `/timesheets/overtime/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
