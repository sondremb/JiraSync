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

export interface BatchUpdateTimesheetValidationModelDTO {
	timeEntries?: TimeEntryDbModelDTO[] | null;
	validationInfo?: string[] | null;
}

export interface BatchUpdateTimesheetWriteModelDTO {
	/** @format int32 */
	timecodeId: number;
	/** @format date-time */
	from: string;
	/** @format date-time */
	to: string;
	/** @format float */
	hours: number;
	comment?: string | null;
}

export interface CustomerDTO {
	id?: string | null;
	name?: string | null;
}

export interface CustomerDurationModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	customerId?: number;
	/** @format date-time */
	startDate?: string;
}

export interface CustomerTimesheetViewModelDTO {
	customer?: CustomerDTO;
	/** @format date-time */
	from?: string;
	/** @format date-time */
	to?: string;
	timecodeTimesheets?: TimecodeTimesheetViewModelDTO[] | null;
}

export interface DepartmentBillingRatioDTO {
	/** @format double */
	billingRatio?: number;
	/** @format int32 */
	departmentId?: number;
}

export interface DivisionDepartmentBillingRatioWeekDTO {
	/** @format int32 */
	divisionId?: number;
	/** @format int32 */
	departmentId?: number;
	/** @format int32 */
	weekNr?: number;
	/** @format int32 */
	year?: number;
	/** @format double */
	billingRatio?: number | null;
	/** @format double */
	availableHours?: number;
	/** @format double */
	billableHours?: number;
}

export interface EgenmeldingerEmployeeModelDTO {
	name?: string | null;
	/** @format int32 */
	id?: number;
	sex?: string | null;
}

export interface EgenmeldingerModelDTO {
	employee?: EgenmeldingerEmployeeModelDTO;
	egenmeldingPeriods?: TimeEntryViewModelDTO[][] | null;
}

export interface EmployeeBillingRatioDTO {
	/** @format double */
	billingRatio?: number;
	/** @format double */
	billableHours?: number;
	/** @format double */
	availableHours?: number;
	/** @format int32 */
	employeeId?: number;
}

export interface EmployeeBillingRatioWeekDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	divisionId?: number;
	/** @format int32 */
	departmentId?: number;
	/** @format int32 */
	weekNr?: number;
	/** @format int32 */
	year?: number;
	/** @format double */
	billingRatio?: number;
	/** @format double */
	availableHours?: number;
	/** @format double */
	billableHours?: number;
}

export interface EmployeeTimecodeHoursDTO {
	/** @format int32 */
	employeeId?: number;
	timecodeHours?: TimecodeHoursDTO[] | null;
}

export interface EmployeeTimeEntriesViewModelDTO {
	employee?: EmployeeViewModelDTO;
	timeEntries?: TimeEntryViewModelDTO[] | null;
	/** @format date-time */
	lockDate?: string;
}

export interface EmployeeTimesheetViewModelDTO {
	employee?: EmployeeViewModelDTO;
	timecodeTimeEntries?: TimecodeTimeEntriesViewModelDTO[] | null;
	/** @format date-time */
	lockDate?: string;
}

export interface EmployeeViewModelDTO {
	/** @format int32 */
	divisionId?: number;
	/** @format int32 */
	departmentId?: number;
	/** @format int32 */
	id?: number;
	name?: string | null;
	mobilePhone?: string | null;
	department?: string | null;
	division?: string | null;
	seniority?: string | null;
}

export interface EmployeeWithIdDTO {
	/** @format int32 */
	id?: number;
}

export interface FavoriteTimecodesDbModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
	timecode?: TimecodeDbModelDTO;
}

export interface FavoriteTimecodeViewModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
}

export interface HealthzDTO {
	/** @format int32 */
	count?: number;
	/** @format int32 */
	healthyCount?: number;
	responses?: HealthzResponseDTO[] | null;
}

export interface HealthzResponseDTO {
	source?: string | null;
	healthy?: boolean;
	message?: string | null;
	type?: string | null;
}

export interface ImportVacationViewModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	year?: number;
	/** @format double */
	balanceTransferred?: number;
	/** @format double */
	balanceCorrected?: number;
	/** @format double */
	usedCorrected?: number;
}

export interface MessageResultDTO {
	/** @format int32 */
	numberOfMessages?: number;
	status?: SentStatusDTO;
}

export interface MinimalTimecodeViewModelDTO {
	/** @format int32 */
	id?: number;
	code?: string | null;
	name?: string | null;
	billable?: boolean;
	workPerformed?: boolean;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	timecodeCategoryId?: number | null;
}

export interface MonthlyHoursLockedStatusDTO {
	/** @format int32 */
	projectId?: number;
	status?: boolean;
}

export interface OvertimeTimeViewModelDTO {
	employee?: EmployeeWithIdDTO;
	/** @format double */
	overtimeHours?: number;
}

export interface PatchDTO {
	op?: string | null;
	path?: string | null;
	value?: boolean | null;
}

export interface ProjectDTO {
	/** @format int32 */
	id?: number;
	/** @format int32 */
	customerId?: number;
	/** @format int32 */
	invoiceManagerId?: number;
	/** @format int32 */
	divisionId?: number;
	/** @format int32 */
	staffingManagerId?: number;
	/** @format int32 */
	technicalManagerId?: number;
}

/** @format int32 */
export enum SentStatusDTO {
	Value0 = 0,
	Value1 = 1,
	Value2 = 2,
	Value3 = 3,
}

export interface StandardEmployeeModelDTO {
	/** @format int32 */
	id?: number;
	name?: string | null;
}

export interface SumOfHoursProjectDTO {
	/** @format int32 */
	projectId?: number;
	/** @format float */
	hours?: number;
}

export interface TimecodeAccessDbModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
	timecode?: TimecodeDbModelDTO;
}

export interface TimecodeAccessViewModelDTO {
	/** @format int32 */
	timecodeId?: number;
	/** @format int32 */
	employeeId?: number;
}

export interface TimecodeCategoryDbModelDTO {
	/** @format int32 */
	id?: number;
	name?: string | null;
	billable?: boolean;
	workPerformed?: boolean;
	paidWork?: boolean;
	overtimeIncluded?: boolean;
	staffable?: boolean;
	prefix?: string | null;
	eligibleForBatchUpdate?: boolean;
}

export interface TimecodeCategoryViewModelDTO {
	/** @format int32 */
	id?: number;
	name?: string | null;
	paidWork?: boolean;
	workPerformed?: boolean;
	billable?: boolean;
	overtimeIncluded?: boolean;
	prefix?: string | null;
	staffable?: boolean;
	eligibleForBatchUpdate?: boolean;
}

export interface TimecodeDbModelDTO {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	name?: string | null;
	/** @format int32 */
	responsibleId?: number | null;
	standardAccount?: boolean;
	active?: boolean;
	description?: string | null;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	categoryId?: number;
	/** @format int32 */
	customerId?: number | null;
	timecodeCategory?: TimecodeCategoryDbModelDTO;
	favoriteTimecodes?: FavoriteTimecodesDbModelDTO[] | null;
	timecodeAccess?: TimecodeAccessDbModelDTO[] | null;
	timesheet?: TimeEntryDbModelDTO[] | null;
}

export interface TimecodeEssentialsDTO {
	/** @format int32 */
	id?: number;
	code?: string | null;
	name?: string | null;
	standardAccount?: boolean;
}

export interface TimecodeHoursDTO {
	/** @format int32 */
	timecodeId?: number;
	/** @format float */
	hours?: number;
}

export interface TimecodeTimeEntriesViewModelDTO {
	timecode?: MinimalTimecodeViewModelDTO;
	entries?: TimeEntryViewModelDTO[] | null;
}

export interface TimecodeTimesheetsWrapperDTO {
	/** @format date-time */
	from?: string;
	/** @format date-time */
	to?: string;
	invoiceManager?: EmployeeViewModelDTO;
	timecodeTimesheets?: TimecodeTimesheetViewModelDTO[] | null;
}

export interface TimecodeTimesheetViewModelDTO {
	timecode?: MinimalTimecodeViewModelDTO;
	project?: ProjectDTO;
	/** @format date-time */
	from?: string | null;
	/** @format date-time */
	to?: string | null;
	employeeTimesheets?: EmployeeTimeEntriesViewModelDTO[] | null;
}

export interface TimecodeViewModelDTO {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	code?: string | null;
	name?: string | null;
	category?: TimecodeCategoryViewModelDTO;
	standardAccount?: boolean;
	active?: boolean;
	description?: string | null;
	paidWork?: boolean;
	overtimeIncluded?: boolean;
	workPerformed?: boolean;
	billable?: boolean;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	customerId?: number | null;
	/** @format int32 */
	responsibleId?: number | null;
}

export interface TimecodeViewModelV3DTO {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	code?: string | null;
	name?: string | null;
	category?: TimecodeCategoryViewModelDTO;
	standardAccount?: boolean;
	/** @format int32 */
	responsibleId?: number | null;
	active?: boolean;
	description?: string | null;
	paidWork?: boolean;
	overtimeIncluded?: boolean;
	workPerformed?: boolean;
	billable?: boolean;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	customerId?: number | null;
	staffable?: boolean;
}

export interface TimecodeWriteModelDTO {
	prefix?: string | null;
	name?: string | null;
	description?: string | null;
	standardAccount?: boolean;
	active?: boolean;
	/** @format int32 */
	counter?: number | null;
	/** @format int32 */
	categoryId?: number;
	/** @format int32 */
	responsibleId?: number | null;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	customerId?: number | null;
}

export interface TimeEntryDbModelDTO {
	/** @format int32 */
	timecodeId?: number;
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	date?: string;
	/** @format float */
	hours?: number;
	comment: string;
	timecode?: TimecodeDbModelDTO;
	code?: string | null;
}

export interface TimeEntryValidationModelDTO {
	/** @format int32 */
	employeeId?: number;
	comment?: string | null;
	/** @format float */
	hours?: number;
	/** @format date-time */
	date?: string;
	/** @format int32 */
	timecodeId?: number;
	billable?: boolean;
	/** @format int32 */
	projectId?: number | null;
	validationInfo?: string[] | null;
}

export interface TimeEntryViewModelDTO {
	/** @format int32 */
	employeeId?: number;
	comment?: string | null;
	/** @format float */
	hours?: number;
	/** @format date-time */
	date?: string;
	/** @format int32 */
	timecodeId?: number;
	billable?: boolean;
	/** @format int32 */
	projectId?: number | null;
}

export interface TimeEntryWriteModelDTO {
	/** @format date-time */
	date?: string;
	/** @format int32 */
	timecodeId?: number;
	comment?: string | null;
	/** @format float */
	hours?: number;
}

export interface TimesheetLockAndHoursDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	lockDate?: string;
	timeEntries?: TimeEntryViewModelDTO[] | null;
}

export interface TimesheetLockDateViewModelDTO {
	timesheetSuccessfullyLocked?: boolean;
	userMessage?: string | null;
	/** @format date-time */
	timesheetLockDate?: string;
}

export interface TimesheetLockViewModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	lockDate?: string;
	employee?: EmployeeViewModelDTO;
}

export interface TimesheetViewModelDTO {
	timeEntries?: TimeEntryViewModelDTO[] | null;
	/** @format date-time */
	timesheetLockDate?: string;
}

export interface VacationViewModelDTO {
	/** @format int32 */
	employeeId?: number;
	/** @format double */
	usedVacationDays?: number;
	/** @format double */
	totalVacationDays?: number;
}

export interface YearlyTimeOffModelViewModelDTO {
	employee?: StandardEmployeeModelDTO;
	/** @format double */
	yearlyTimeOffRemaining?: number;
	/** @format double */
	yearlyTimeOffUsed?: number;
	/** @format double */
	yearlyTimeOffEarned?: number;
}
