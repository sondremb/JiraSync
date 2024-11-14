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

import { ImportVacationViewModelDTO, VacationViewModelDTO } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Vacation<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Vacation
	 * @name VacationDetail
	 * @request GET:/vacation/{employeeId}
	 * @secure
	 */
	vacationDetail = (
		employeeId: number,
		query?: {
			/** @format int32 */
			year?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<VacationViewModelDTO, any>({
			path: `/vacation/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Vacation
	 * @name VacationList
	 * @request GET:/vacation
	 * @secure
	 */
	vacationList = (
		query?: {
			/** @format int32 */
			year?: number;
		},
		params: RequestParams = {},
	) =>
		this.request<VacationViewModelDTO[], any>({
			path: `/vacation`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Vacation
	 * @name ImportPartialUpdate
	 * @request PATCH:/vacation/import
	 * @secure
	 */
	importPartialUpdate = (
		data: {
			"excel-files"?: File[];
		},
		query?: {
			/** @default true */
			"dry-run"?: boolean;
			/** @default true */
			"return-diff"?: boolean;
		},
		params: RequestParams = {},
	) =>
		this.request<ImportVacationViewModelDTO[], any>({
			path: `/vacation/import`,
			method: "PATCH",
			query: query,
			body: data,
			secure: true,
			type: ContentType.FormData,
			format: "json",
			...params,
		});
}
