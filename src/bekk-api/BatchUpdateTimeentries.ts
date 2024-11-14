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

import { BatchUpdateTimesheetValidationModelDTO, BatchUpdateTimesheetWriteModelDTO } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class BatchUpdateTimeentries<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags BatchUpdateTimesheets
	 * @name BatchUpdateTimeentriesCreate
	 * @request POST:/batch-update-timeentries/{employeeId}
	 * @secure
	 */
	batchUpdateTimeentriesCreate = (
		employeeId: number,
		data: BatchUpdateTimesheetWriteModelDTO,
		params: RequestParams = {},
	) =>
		this.request<BatchUpdateTimesheetValidationModelDTO, any>({
			path: `/batch-update-timeentries/${employeeId}`,
			method: "POST",
			body: data,
			secure: true,
			type: ContentType.Json,
			format: "json",
			...params,
		});
}
