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

import { EmployeeBillingRatioDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Utilizationrate<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name EmployeesList
	 * @request GET:/utilizationrate/employees
	 * @secure
	 */
	employeesList = (params: RequestParams = {}) =>
		this.request<EmployeeBillingRatioDTO[], any>({
			path: `/utilizationrate/employees`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
