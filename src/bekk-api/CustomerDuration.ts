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

import { CustomerDurationModelDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class CustomerDuration<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags CustomerDuration
	 * @name EmployeesList
	 * @request GET:/customer-duration/employees
	 * @secure
	 */
	employeesList = (params: RequestParams = {}) =>
		this.request<CustomerDurationModelDTO[], any>({
			path: `/customer-duration/employees`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
}
