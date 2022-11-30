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

import { EmployeeTimecodeHoursDTO, FavoriteTimecodeViewModelDTO, TimecodeViewModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Employees<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags FavoriteTimecodes
	 * @name FavoritetimecodesDetail
	 * @request GET:/employees/{employeeId}/favoritetimecodes
	 * @secure
	 */
	favoritetimecodesDetail = (employeeId: number, params: RequestParams = {}) =>
		this.request<TimecodeViewModelDTO[], any>({
			path: `/employees/${employeeId}/favoritetimecodes`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags FavoriteTimecodes
	 * @name FavoriteTimecodesUpdate
	 * @request PUT:/employees/{employeeId}/favoriteTimecodes/{timecodeId}
	 * @secure
	 */
	favoriteTimecodesUpdate = (employeeId: number, timecodeId: number, params: RequestParams = {}) =>
		this.request<FavoriteTimecodeViewModelDTO, any>({
			path: `/employees/${employeeId}/favoriteTimecodes/${timecodeId}`,
			method: "PUT",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags FavoriteTimecodes
	 * @name FavoriteTimecodesDelete
	 * @request DELETE:/employees/{employeeId}/favoriteTimecodes/{timecodeId}
	 * @secure
	 */
	favoriteTimecodesDelete = (employeeId: number, timecodeId: number, params: RequestParams = {}) =>
		this.request<void, any>({
			path: `/employees/${employeeId}/favoriteTimecodes/${timecodeId}`,
			method: "DELETE",
			secure: true,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timesheets
	 * @name TimecodeHoursList
	 * @request GET:/employees/timecode-hours
	 * @secure
	 */
	timecodeHoursList = (
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeTimecodeHoursDTO, any>({
			path: `/employees/timecode-hours`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
