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
	DepartmentBillingRatio,
	DivisionDepartmentBillingRatioWeek,
	EmployeeBillingRatio,
	EmployeeBillingRatioWeek,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Billingratio<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name EmployeeDetail
	 * @request GET:/billingratio/employee/{id}
	 * @secure
	 */
	employeeDetail = (
		id: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeBillingRatio, any>({
			path: `/billingratio/employee/${id}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name DepartmentDetail
	 * @request GET:/billingratio/department/{id}
	 * @secure
	 */
	departmentDetail = (
		id: number,
		query?: {
			/** @format date-time */
			from?: string;
			/** @format date-time */
			to?: string;
		},
		params: RequestParams = {},
	) =>
		this.request<DepartmentBillingRatio, any>({
			path: `/billingratio/department/${id}`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name EmployeesPeriodList
	 * @request GET:/billingratio/employees/period
	 * @secure
	 */
	employeesPeriodList = (
		query: {
			/** @format date-time */
			From: string;
			/** @format date-time */
			To: string;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeBillingRatio, any>({
			path: `/billingratio/employees/period`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name EmployeesList
	 * @request GET:/billingratio/employees
	 * @secure
	 */
	employeesList = (params: RequestParams = {}) =>
		this.request<EmployeeBillingRatio[], any>({
			path: `/billingratio/employees`,
			method: "GET",
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name EmployeesWeeklyList
	 * @request GET:/billingratio/employees/weekly
	 * @secure
	 */
	employeesWeeklyList = (
		query: {
			/**
			 * @format int32
			 * @min 0
			 * @max 53
			 */
			FromWeek: number;
			/**
			 * @format int32
			 * @min 1990
			 * @max 2100
			 */
			FromYear: number;
			/**
			 * @format int32
			 * @min 0
			 * @max 53
			 */
			ToWeek: number;
			/**
			 * @format int32
			 * @min 1990
			 * @max 2100
			 */
			ToYear: number;
		},
		params: RequestParams = {},
	) =>
		this.request<EmployeeBillingRatioWeek[], any>({
			path: `/billingratio/employees/weekly`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
	/**
	 * No description
	 *
	 * @tags BillingRatio
	 * @name DepartmentsWeeklyList
	 * @request GET:/billingratio/departments/weekly
	 * @secure
	 */
	departmentsWeeklyList = (
		query: {
			/**
			 * @format int32
			 * @min 0
			 * @max 53
			 */
			FromWeek: number;
			/**
			 * @format int32
			 * @min 1990
			 * @max 2100
			 */
			FromYear: number;
			/**
			 * @format int32
			 * @min 0
			 * @max 53
			 */
			ToWeek: number;
			/**
			 * @format int32
			 * @min 1990
			 * @max 2100
			 */
			ToYear: number;
		},
		params: RequestParams = {},
	) =>
		this.request<DivisionDepartmentBillingRatioWeek[], any>({
			path: `/billingratio/departments/weekly`,
			method: "GET",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
