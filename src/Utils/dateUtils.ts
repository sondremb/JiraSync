import moment, { Moment } from "moment";

function getStartOfWeek(d?: Moment) {
	return moment(d).startOf("week");
}

function getEndOfWeek(d?: Moment) {
	return moment(d).endOf("week");
}

export const getStartAndEndOfWeek = (date?: Moment): [Moment, Moment] => {
	return [getStartOfWeek(date), getEndOfWeek(date)];
};

export const getNextWeek = (date: Moment): [Moment, Moment] => {
	return getStartAndEndOfWeek(moment(date).add(7, "days"));
};

export const getPreviousWeek = (date: Moment): [Moment, Moment] => {
	return getStartAndEndOfWeek(moment(date).subtract(7, "days"));
};

export function toDateString(date: Date | moment.Moment) {
	return moment(date).format("YYYY-MM-DD");
}

export function secondsToHours(seconds: number): number {
	return seconds / 3600;
}

export function dayRange(fromDate: Moment, toDate: Moment) {
	const days = [];
	for (let m = moment(fromDate); m.isSameOrBefore(toDate); m.add(1, "days")) {
		days.push(moment(m));
	}
	return days;
}
