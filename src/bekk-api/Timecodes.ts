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

import { PatchDTO, TimecodeCategoryViewModelDTO, TimecodeViewModelDTO, TimecodeWriteModelDTO } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Timecodes<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesList
	 * @request GET:/timecodes
	 * @secure
	 */
	timecodesList = (
		query?: {
			/** @format int32 */
			projectId?: number;
			billable?: boolean;
			standardAccount?: boolean;
			active?: boolean;
			search?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<TimecodeViewModelDTO[], any>({
			path: `/timecodes`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesCreate
	 * @request POST:/timecodes
	 * @secure
	 */
	timecodesCreate = (data: TimecodeWriteModelDTO, params: RequestParams = {}) =>
		this.request<TimecodeViewModelDTO, any>({
			path: `/timecodes`,
			method: "POST",
			body: data,
			secure: true,
			type: ContentType.Json,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesPartialUpdate
	 * @request PATCH:/timecodes
	 * @secure
	 */
	timecodesPartialUpdate = (data: PatchDTO[], params: RequestParams = {}) =>
		this.request<void, any>({
			path: `/timecodes`,
			method: "PATCH",
			body: data,
			secure: true,
			type: ContentType.Json,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesDetail
	 * @request GET:/timecodes/{timecodeId}
	 * @secure
	 */
	timecodesDetail = (timecodeId: number, params: RequestParams = {}) =>
		this.request<TimecodeViewModelDTO, any>({
			path: `/timecodes/${timecodeId}`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name TimecodesUpdate
	 * @request PUT:/timecodes/{timecodeId}
	 * @secure
	 */
	timecodesUpdate = (timecodeId: number, data: TimecodeWriteModelDTO, params: RequestParams = {}) =>
		this.request<TimecodeViewModelDTO, any>({
			path: `/timecodes/${timecodeId}`,
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
	 * @tags Timecode
	 * @name TimecodesDelete
	 * @request DELETE:/timecodes/{timecodeId}
	 * @secure
	 */
	timecodesDelete = (
		timecodeId: number,
		query?: {
			/** @format int32 */
			userId?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<void, any>({
			path: `/timecodes/${timecodeId}`,
			method: "DELETE",
			query: query,
			secure: true,
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Timecode
	 * @name CategoriesList
	 * @request GET:/timecodes/categories
	 * @secure
	 */
	categoriesList = (params: RequestParams = {}) =>
		this.request<TimecodeCategoryViewModelDTO[], any>({
			path: `/timecodes/categories`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
