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
	TimeEntryValidationModelDTO,
	TimeEntryViewModelDTO,
	TimeEntryWriteModelDTO,
	TimesheetLockDateViewModelDTO,
	TimesheetLockViewModelDTO,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Timesheets<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name EmployeeUpdate
	 * @request PUT:/timesheets/employee/{employeeId}
	 * @secure
	 */
	employeeUpdate = (employeeId: number, data: TimeEntryWriteModelDTO, params: RequestParams = {}) =>
		this.request<TimeEntryValidationModelDTO, any>({
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
	employeeDelete = (employeeId: number, data: TimeEntryWriteModelDTO, params: RequestParams = {}) =>
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
		this.request<TimesheetLockDateViewModelDTO, any>({
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
		this.request<TimesheetLockViewModelDTO[], any>({
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
		this.request<TimesheetLockViewModelDTO, any>({
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
		this.request<TimeEntryViewModelDTO[], any>({
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
		this.request<TimeEntryViewModelDTO[], any>({
			path: `/timesheets/projects/${projectId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
