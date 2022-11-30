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

import { EgenmeldingerModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Egenmeldinger<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags Egenmeldinger
	 * @name EmployeesList
	 * @request GET:/egenmeldinger/employees
	 * @secure
	 */
	employeesList = (params: RequestParams = {}) =>
		this.request<EgenmeldingerModelDTO[], any>({
			path: `/egenmeldinger/employees`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags Egenmeldinger
	 * @name EmployeesDetail
	 * @request GET:/egenmeldinger/employees/{employeeId}
	 * @secure
	 */
	employeesDetail = (employeeId: number, params: RequestParams = {}) =>
		this.request<EgenmeldingerModelDTO, any>({
			path: `/egenmeldinger/employees/${employeeId}`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
