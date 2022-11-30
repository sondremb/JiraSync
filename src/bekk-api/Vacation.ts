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

import { VacationModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

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
			/** @format date-time */
			startDate?: string;
			/** @format date-time */
			endDate?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<VacationModelDTO, any>({
			path: `/vacation/${employeeId}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
