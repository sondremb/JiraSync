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

import { MonthlyHoursLockedStatusDTO, TimesheetLockAndHoursDTO } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Projects<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags LockHours
	 * @name LockStatusCreate
	 * @request POST:/projects/lock-status
	 * @secure
	 */
	lockStatusCreate = (
		data: number[],
		query?: {
			/** @format int32 */
			year?: number;
			/** @format int32 */
			month?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<MonthlyHoursLockedStatusDTO[], any>({
			path: `/projects/lock-status`,
			method: "POST",
			query: query,
			body: data,
			secure: true,
			type: ContentType.Json,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags LockHours
	 * @name LockhoursDetail
	 * @request GET:/projects/{projectId}/lockhours
	 * @secure
	 */
	lockhoursDetail = (
		projectId: number,
		query?: {
			/** @format int32 */
			month?: number;
			/** @format int32 */
			year?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<TimesheetLockAndHoursDTO[], any>({
			path: `/projects/${projectId}/lockhours`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
