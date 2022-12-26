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

export class WeekAndYear {
	year: number;
	week: number;
	constructor(year: number, week: number) {
		this.year = year;
		this.week = week;
	}

	static fromMoment(m: Moment): WeekAndYear {
		return new WeekAndYear(m.year(), m.week());
	}

	static now(): WeekAndYear {
		return WeekAndYear.fromMoment(moment());
	}

	toMoment(): Moment {
		return moment().year(this.year).week(this.week);
	}

	next(): WeekAndYear {
		return WeekAndYear.fromMoment(this.toMoment().add(1, "week"));
	}

	previous(): WeekAndYear {
		return WeekAndYear.fromMoment(this.toMoment().subtract(1, "week"));
	}

	start(): Moment {
		return getStartOfWeek(this.toMoment());
	}

	end(): Moment {
		return getEndOfWeek(this.toMoment());
	}

	days(): Moment[] {
		return dayRange(this.start(), this.end());
	}
}

export class MonthAndYear {
	year: number;
	month: number;
	constructor(year: number, month: number) {
		this.year = year;
		this.month = month;
	}

	static fromMoment(m: Moment): MonthAndYear {
		return new MonthAndYear(m.year(), m.month());
	}

	static now(): MonthAndYear {
		return MonthAndYear.fromMoment(moment());
	}

	get monthName(): string {
		return this.toMoment().format("MMMM");
	}

	toMoment(): Moment {
		return moment().year(this.year).month(this.month);
	}

	next(): MonthAndYear {
		return MonthAndYear.fromMoment(this.toMoment().add(1, "month"));
	}

	previous(): MonthAndYear {
		return MonthAndYear.fromMoment(this.toMoment().subtract(1, "month"));
	}

	start(): Moment {
		return this.toMoment().startOf("month");
	}

	end(): Moment {
		return this.toMoment().endOf("month");
	}

	startOfFirstWeek(): Moment {
		return this.start().startOf("week");
	}

	endOfLastWeek(): Moment {
		return this.end().endOf("week");
	}

	weeks(): WeekAndYear[] {
		let week = WeekAndYear.fromMoment(this.start());
		const weeks = [week];
		const endWeek = this.end().week();
		while (week.week !== endWeek) {
			week = week.next();
			weeks.push(week);
		}
		return weeks;
	}

	days(): Moment[] {
		return dayRange(this.start(), this.end());
	}

	daysFullWeeks(): Moment[] {
		return dayRange(this.startOfFirstWeek(), this.endOfLastWeek());
	}

	contains(day: Moment): boolean {
		return day.year() === this.year && day.month() === this.month;
	}
}
