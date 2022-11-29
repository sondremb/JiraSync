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

import { VacationModel } from "./data-contracts";
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
	vacationDetail = (employeeId: number, params: RequestParams = {}) =>
		this.request<VacationModel, any>({
			path: `/vacation/${employeeId}`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
