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

export interface BatchUpdateTimesheetWriteModel {
	/** @format int32 */
	timecodeId: number;
	/** @format date-time */
	from: string;
	/** @format date-time */
	to: string;
	comment?: string | null;
}

export interface Customer {
	id?: string | null;
	name?: string | null;
}

export interface CustomerDurationModel {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	customerId?: number;
	/** @format date-time */
	startDate?: string;
}

export interface CustomerTimesheetViewModel {
	customer?: Customer;
	/** @format date-time */
	from?: string;
	/** @format date-time */
	to?: string;
	timecodeTimesheets?: TimecodeTimesheetViewModel[] | null;
}

export interface DepartmentBillingRatio {
	/** @format double */
	billingRatio?: number;
	/** @format int32 */
	departmentId?: number;
}

export interface DivisionDepartmentBillingRatioWeek {
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

export interface EgenmeldingerEmployeeModel {
	name?: string | null;
	/** @format int32 */
	id?: number;
	sex?: string | null;
}

export interface EgenmeldingerModel {
	employee?: EgenmeldingerEmployeeModel;
	egenmeldingPeriods?: TimeEntryViewModel[][] | null;
}

export interface EmployeeBillingRatio {
	/** @format double */
	billingRatio?: number;
	/** @format double */
	billableHours?: number;
	/** @format double */
	availableHours?: number;
	/** @format int32 */
	employeeId?: number;
}

export interface EmployeeBillingRatioWeek {
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

export interface EmployeeTimecodeHours {
	/** @format int32 */
	employeeId?: number;
	timecodeHours?: TimecodeHours[] | null;
}

export interface EmployeeTimeEntriesViewModel {
	employee?: EmployeeViewModel;
	timeEntries?: TimeEntryViewModel[] | null;
	/** @format date-time */
	lockDate?: string;
}

export interface EmployeeTimesheetViewModel {
	employee?: EmployeeViewModel;
	timecodeTimeEntries?: TimecodeTimeEntriesViewModel[] | null;
	/** @format date-time */
	lockDate?: string;
}

export interface EmployeeViewModel {
	/** @format int32 */
	divisionId?: number;
	/** @format int32 */
	departmentId?: number;
	/** @format int32 */
	id?: number;
	name?: string | null;
	mobilePhone?: string | null;
	department?: string | null;
}

export interface EmployeeWithId {
	/** @format int32 */
	id?: number;
}

export interface FavoriteTimecodesDbModel {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
	timecode?: TimecodeDbModel;
}

export interface FavoriteTimecodeViewModel {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
}

export interface Healthz {
	/** @format int32 */
	count?: number;
	/** @format int32 */
	healthyCount?: number;
	responses?: HealthzResponse[] | null;
}

export interface HealthzResponse {
	source?: string | null;
	healthy?: boolean;
	message?: string | null;
	type?: string | null;
}

export interface MonthlyHoursLockedStatus {
	/** @format int32 */
	projectId?: number;
	status?: boolean;
}

export interface OvertimeTimeViewModel {
	employee?: EmployeeWithId;
	/** @format double */
	overtimeHours?: number;
}

export interface Patch {
	op?: string | null;
	path?: string | null;
	value?: boolean | null;
}

export interface Project {
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

export interface StandardEmployeeModel {
	/** @format int32 */
	id?: number;
	name?: string | null;
}

export interface SumOfHoursProject {
	/** @format int32 */
	projectId?: number;
	/** @format double */
	hours?: number;
}

export interface TimecodeAccessDbModel {
	/** @format int32 */
	employeeId?: number;
	/** @format int32 */
	timecodeId?: number;
	timecode?: TimecodeDbModel;
}

export interface TimecodeAccessViewModel {
	/** @format int32 */
	timecodeId?: number;
	/** @format int32 */
	employeeId?: number;
}

export interface TimecodeCategoryDbModel {
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

export interface TimecodeCategoryViewModel {
	/** @format int32 */
	id?: number;
	name?: string | null;
	paidWork?: boolean;
	workPerformed?: boolean;
	billable?: boolean;
	overtimeIncluded?: boolean;
	prefix?: string | null;
	staffable?: boolean;
}

export interface TimecodeDbModel {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	name?: string | null;
	/** @format int32 */
	responsibleId?: number | null;
	lunchDeduction?: boolean;
	standardAccount?: boolean;
	active?: boolean;
	description?: string | null;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	categoryId?: number;
	/** @format int32 */
	customerId?: number | null;
	staffingOnly?: boolean;
	timecodeCategory?: TimecodeCategoryDbModel;
	favoriteTimecodes?: FavoriteTimecodesDbModel[] | null;
	timecodeAccess?: TimecodeAccessDbModel[] | null;
	timesheet?: TimeEntryDbModel[] | null;
}

export interface TimecodeEssentials {
	/** @format int32 */
	id?: number;
	code?: string | null;
	name?: string | null;
	standardAccount?: boolean;
}

export interface TimecodeHours {
	/** @format int32 */
	timecodeId?: number;
	/** @format float */
	hours?: number;
}

export interface TimecodeTimeEntriesViewModel {
	timecode?: TimecodeViewModelV2;
	entries?: TimeEntryViewModel[] | null;
}

export interface TimecodeTimesheetsWrapper {
	/** @format date-time */
	from?: string;
	/** @format date-time */
	to?: string;
	invoiceManager?: EmployeeViewModel;
	timecodeTimesheets?: TimecodeTimesheetViewModel[] | null;
}

export interface TimecodeTimesheetViewModel {
	timecode?: TimecodeViewModelV2;
	project?: Project;
	/** @format date-time */
	from?: string | null;
	/** @format date-time */
	to?: string | null;
	employeeTimesheets?: EmployeeTimeEntriesViewModel[] | null;
}

export interface TimecodeViewModel {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	code?: string | null;
	name?: string | null;
	category?: TimecodeCategoryViewModel;
	standardAccount?: boolean;
	lunchDeduction?: boolean;
	active?: boolean;
	description?: string | null;
	paidWork?: boolean;
	overtimeIncluded?: boolean;
	workPerformed?: boolean;
	billable?: boolean;
	staffingOnly?: boolean;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	customerId?: number | null;
	/** @format int32 */
	responsibleId?: number | null;
}

export interface TimecodeViewModelV2 {
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

export interface TimecodeViewModelV3 {
	/** @format int32 */
	id?: number;
	prefix?: string | null;
	/** @format int32 */
	counter?: number;
	code?: string | null;
	name?: string | null;
	category?: TimecodeCategoryViewModel;
	standardAccount?: boolean;
	/** @format int32 */
	responsibleId?: number | null;
	lunchDeduction?: boolean;
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
	staffingOnly?: boolean;
	/** @format int32 */
	staffingManagerId?: number;
	/** @format int32 */
	technicalManagerId?: number;
	/** @format int32 */
	division?: number;
	staffable?: boolean;
}

export interface TimecodeWriteModel {
	prefix?: string | null;
	name?: string | null;
	description?: string | null;
	standardAccount?: boolean;
	lunchDeduction?: boolean;
	active?: boolean;
	/** @format int32 */
	categoryId?: number;
	/** @format int32 */
	responsibleId?: number | null;
	/** @format int32 */
	projectId?: number | null;
	/** @format int32 */
	customerId?: number | null;
	staffingOnly?: boolean;
}

export interface TimeEntryDbModel {
	/** @format int32 */
	timecodeId?: number;
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	date?: string;
	/** @format float */
	hours?: number;
	comment: string;
	timecode?: TimecodeDbModel;
	code?: string | null;
}

export interface TimeEntryViewModel {
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

export interface TimeEntryWriteModel {
	/** @format date-time */
	date?: string;
	/** @format int32 */
	timecodeId?: number;
	comment?: string | null;
	/** @format float */
	hours?: number;
}

export interface TimesheetLockAndHours {
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	lockDate?: string;
	timeEntries?: TimeEntryViewModel[] | null;
}

export interface TimesheetLockDateViewModel {
	timesheetSuccessfullyLocked?: boolean;
	userMessage?: string | null;
	/** @format date-time */
	timesheetLockDate?: string;
}

export interface TimesheetLockViewModel {
	/** @format int32 */
	employeeId?: number;
	/** @format date-time */
	lockDate?: string;
	employee?: EmployeeViewModel;
}

export interface TimesheetViewModel {
	timeEntries?: TimeEntryViewModel[] | null;
	/** @format date-time */
	timesheetLockDate?: string;
}

export type VacationModel = object;

export interface YearlyTimeOffModelViewModel {
	employee?: StandardEmployeeModel;
	/** @format double */
	yearlyTimeOffRemaining?: number;
	/** @format double */
	yearlyTimeOffUsed?: number;
	/** @format double */
	yearlyTimeOffEarned?: number;
}
