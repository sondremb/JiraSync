import {
	addDays,
	eachDayOfInterval,
	formatISO,
	getISOWeek,
	getISOWeekYear,
	parseISO,
	set,
	setISODay,
	setISOWeek,
	setISOWeekYear,
	startOfISOWeekYear,
	subDays,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { Brand } from "../Utils/brandedTypes";

export const NORWAY_TIMEZONE = "Europe/Oslo";

export type IsoWeek = Brand<string, "IsoWeek">;
export type IsoDate = Brand<string, "IsoDate">;

export const IsoWeek = {
	days: (week: IsoWeek): IsoDate[] => {
		return [1, 2, 3, 4, 5, 6, 7].map((day) => IsoWeek.getDay(week, day));
	},
	getDay(week: IsoWeek, day: number): IsoDate {
		if (![1, 2, 3, 4, 5, 6, 7].includes(day)) {
			throw new Error("Day must be integer between 1 and 7");
		}
		const { year, week: weekNumber } = IsoWeek.toParts(week);
		const date = startOfISOWeekYear(new Date());
		const dateInYear = setISOWeekYear(date, year);
		const dateInWeek = setISOWeek(dateInYear, weekNumber);
		return IsoDate.fromDate(setISODay(dateInWeek, day));
	},
	monday: (week: IsoWeek): IsoDate => {
		return IsoWeek.getDay(week, 1);
	},
	sunday: (week: IsoWeek): IsoDate => {
		return IsoWeek.getDay(week, 7);
	},
	toParts: (week: IsoWeek): { year: number; week: number } => {
		const [year, weekNumber] = week.split("-W").map((x) => parseInt(x, 10));
		return { year, week: weekNumber };
	},
	isValid: (input: string): input is IsoWeek => {
		const match = input.match(/^(\d{4})-W(\d{2})$/);
		if (!match) {
			return false;
		}
		const year = parseInt(match[1], 10);
		const week = parseInt(match[2], 10);
		const date = new Date(year, 0, 4); // Jan 4th is always in week 1
		const date2 = setISOWeek(date, week);
		if (getISOWeekYear(date2) !== year || getISOWeek(date2) !== week) {
			return false;
		}
		return true;
	},
	parse(input: string): IsoWeek {
		if (!IsoWeek.isValid(input)) {
			throw new Error(`Invalid IsoWeek string: ${input}`);
		}
		return input as IsoWeek;
	},
	fromDate(date: Date): IsoWeek {
		// always use norwegian timezone
		date = toZonedTime(date, NORWAY_TIMEZONE);
		const week = getISOWeek(date);
		const year = getISOWeekYear(date);
		return `${year}-W${week.toString().padStart(2, "0")}` as IsoWeek;
	},
	next(week: IsoWeek): IsoWeek {
		const monday = IsoWeek.monday(week);
		const mondayDate = IsoDate.toDate(monday);
		const nextMonday = addDays(mondayDate, 7);
		return IsoWeek.fromDate(nextMonday);
	},
	previous(week: IsoWeek): IsoWeek {
		const monday = IsoWeek.monday(week);
		const mondayDate = IsoDate.toDate(monday);
		const previousMonday = subDays(mondayDate, 7);
		return IsoWeek.fromDate(previousMonday);
	},
};

export const IsoDate = {
	fromDate(date: Date): IsoDate {
		// always use norwegian timezone
		date = toZonedTime(date, NORWAY_TIMEZONE);
		return formatISO(date, { representation: "date" }) as IsoDate;
	},
	range(from: IsoDate, to: IsoDate): IsoDate[] {
		const start = IsoDate.toDate(from);
		const end = IsoDate.toDate(to);

		return eachDayOfInterval({ start, end }).map((date) =>
			IsoDate.fromDate(date)
		);
	},
	toDate(isoDate: IsoDate): Date {
		const parsed = parseISO(isoDate as string);
		const atNoon = set(parsed, {
			hours: 12,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		});
		return fromZonedTime(atNoon, NORWAY_TIMEZONE);
	},
	parse(input: string): IsoDate {
		const parsed = parseISO(input);
		if (isNaN(parsed.getTime())) {
			throw new Error(`Invalid IsoDate string: ${input}`);
		}
		return input as IsoDate;
	},
};
