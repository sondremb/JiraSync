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

import { MessageResultDTO } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Lockhours<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
	/**
	 * No description
	 *
	 * @tags TimesheetLock
	 * @name SmsReminderCreate
	 * @request POST:/lockhours/sms-reminder
	 * @secure
	 */
	smsReminderCreate = (
		query?: {
			period?: string;
			/** @default true */
			dryRun?: boolean;
		},
		params: RequestParams = {},
	) =>
		this.request<MessageResultDTO, any>({
			path: `/lockhours/sms-reminder`,
			method: "POST",
			query: query,
			secure: true,
			format: "json",
			...params,
		});
}
