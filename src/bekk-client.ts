import { Timesheets } from "./bekk-api/Timesheets";
import { V3 } from "./bekk-api/V3";
import { useEmployeeId } from "./login/bekk/example2";
import { BekkId, DateString } from "./types";
import { useClientFactory } from "./Utils/bekkClientUtils";
import { IsoDate } from "./date-time/IsoWeek";

export interface BekkRequestParams {
	fromDate: IsoDate;
	toDate: IsoDate;
}

export interface PutTimesheetParams {
	timecodeId: BekkId;
	dateString: DateString;
	hours: number;
}

export interface GetLockdateReturn {
	employeeId: number;
	lockDate: DateString;
}

export const useBekkClient = () => {
	const createClient = useClientFactory();
	const employeeId = useEmployeeId();
	return {
		getData: (params: BekkRequestParams) => {
			const client = createClient(V3);
			return client.timesheetsEmployeesDetail(employeeId, {
				From: params.fromDate,
				To: params.toDate,
			});
		},
		updateTimesheet: (params: PutTimesheetParams) => {
			const client = createClient(Timesheets);
			return client.employeeUpdate(employeeId, {
				timecodeId: params.timecodeId,
				hours: params.hours,
				date: params.dateString,
				comment: "",
			});
		},
		setLockDate: (lockDate: DateString) => {
			const client = createClient(Timesheets);
			return client.lockhoursUpdate({
				employeeId,
				lockDate,
			});
		},
	};
};
