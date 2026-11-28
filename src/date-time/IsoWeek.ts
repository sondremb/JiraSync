import {
	addDays,
	eachDayOfInterval,
	format,
	formatISO,
	getISODay,
	getISOWeek,
	getISOWeekYear,
	parseISO,
	set,
	setISODay,
	setISOWeek,
	setISOWeekYear,
	startOfISOWeekYear,
	subDays,
	type FormatOptions,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { Brand } from "../Utils/brandedTypes";
import { capitalize } from "../Utils/capitalize";

/** The timezone every date and week is computed in, whatever the browser's. */
export const NORWAY_TIMEZONE = "Europe/Oslo";

/** An ISO week, formatted `YYYY-Www`. */
export type IsoWeek = Brand<string, "IsoWeek">;
/** A calendar date in Norway, formatted `YYYY-MM-DD`. */
export type IsoDate = Brand<string, "IsoDate">;
/** A calendar month, formatted `YYYY-MM`. */
export type IsoMonth = Brand<string, "IsoMonth">;

/** An ISO week, formatted `YYYY-Www`. */
export const IsoWeek = {
	/** The week's seven days, Monday first. */
	days: (week: IsoWeek): IsoDate[] => {
		return [1, 2, 3, 4, 5, 6, 7].map((day) => IsoWeek.getDay(week, day));
	},
	/** The week's day by ISO weekday (1 = Monday, 7 = Sunday). */
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
	/** The week's Monday. */
	monday: (week: IsoWeek): IsoDate => {
		return IsoWeek.getDay(week, 1);
	},
	/** The week's Sunday. */
	sunday: (week: IsoWeek): IsoDate => {
		return IsoWeek.getDay(week, 7);
	},
	/** The ISO week-year and week number. */
	toParts: (week: IsoWeek): { year: number; week: number } => {
		const [year, weekNumber] = week.split("-W").map((x) => parseInt(x, 10));
		return { year, week: weekNumber };
	},
	/** Whether the input is a `YYYY-Www` week that exists in its year. */
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
	/** Brands a `YYYY-Www` string, throwing if it isn't a valid week. */
	parse(input: string): IsoWeek {
		if (!IsoWeek.isValid(input)) {
			throw new Error(`Invalid IsoWeek string: ${input}`);
		}
		return input as IsoWeek;
	},
	/** The week the instant falls in, in Norway. */
	fromDate(date: Date): IsoWeek {
		// always use norwegian timezone
		date = toZonedTime(date, NORWAY_TIMEZONE);
		const week = getISOWeek(date);
		const year = getISOWeekYear(date);
		return `${year}-W${week.toString().padStart(2, "0")}` as IsoWeek;
	},
	/** The week the date falls in. */
	fromIsoDate(isoDate: IsoDate): IsoWeek {
		const date = IsoDate.toDate(isoDate);
		return IsoWeek.fromDate(date);
	},
	/** The week after. */
	next(week: IsoWeek): IsoWeek {
		const monday = IsoWeek.monday(week);
		const mondayDate = IsoDate.toDate(monday);
		const nextMonday = addDays(mondayDate, 7);
		return IsoWeek.fromDate(nextMonday);
	},
	/** Short Norwegian date range: "23.–29. nov", or "30. nov–6. des" across months. */
	formatRange(week: IsoWeek): string {
		const monday = IsoWeek.monday(week);
		const sunday = IsoWeek.sunday(week);
		const month = (date: IsoDate) =>
			new Intl.DateTimeFormat("nb-NO", {
				month: "short",
				timeZone: NORWAY_TIMEZONE,
			})
				.format(IsoDate.toDate(date))
				.replace(/\.$/, "");
		const day = (date: IsoDate) => IsoDate.format(date, "d");
		return month(monday) === month(sunday)
			? `${day(monday)}.–${day(sunday)}. ${month(sunday)}`
			: `${day(monday)}. ${month(monday)}–${day(sunday)}. ${month(sunday)}`;
	},
	/** The week before. */
	previous(week: IsoWeek): IsoWeek {
		const monday = IsoWeek.monday(week);
		const mondayDate = IsoDate.toDate(monday);
		const previousMonday = subDays(mondayDate, 7);
		return IsoWeek.fromDate(previousMonday);
	},
};

/** A calendar date in Norway, formatted `YYYY-MM-DD`. */
export const IsoDate = {
	/** The date the instant falls on, in Norway. */
	fromDate(date: Date): IsoDate {
		// always use norwegian timezone
		date = toZonedTime(date, NORWAY_TIMEZONE);
		return formatISO(date, { representation: "date" }) as IsoDate;
	},
	/** Every date from `from` through `to`, both included. */
	range(from: IsoDate, to: IsoDate): IsoDate[] {
		const start = IsoDate.toDate(from);
		const end = IsoDate.toDate(to);

		return eachDayOfInterval({ start, end }).map((date) =>
			IsoDate.fromDate(date),
		);
	},
	/** Noon on the date in Norway, so no timezone shifts it to another day. */
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
	/** The given time of day on the date, in Norway. */
	toDateAt(
		isoDate: IsoDate,
		time: { hours: number; minutes: number; seconds?: number },
	): Date {
		const parsed = parseISO(isoDate as string);
		const atTime = set(parsed, {
			hours: time.hours,
			minutes: time.minutes,
			seconds: time.seconds ?? 0,
			milliseconds: 0,
		});
		return fromZonedTime(atTime, NORWAY_TIMEZONE);
	},
	/** Brands an ISO date string, throwing if it isn't a valid date. */
	parse(input: string): IsoDate {
		const parsed = parseISO(input);
		if (isNaN(parsed.getTime())) {
			throw new Error(`Invalid IsoDate string: ${input}`);
		}
		return input as IsoDate;
	},
	/** Capitalised Norwegian weekday, day and month: "Mandag 5. oktober". */
	formatLong(isoDate: IsoDate): string {
		const text = new Intl.DateTimeFormat("nb-NO", {
			weekday: "long",
			day: "numeric",
			month: "long",
			timeZone: NORWAY_TIMEZONE,
		}).format(IsoDate.toDate(isoDate));
		return capitalize(text);
	},
	/** ISO weekday (1 = Monday, 7 = Sunday), whatever the browser's timezone. */
	weekday(isoDate: IsoDate): number {
		return getISODay(toZonedTime(IsoDate.toDate(isoDate), NORWAY_TIMEZONE));
	},
	/** date-fns `format`, but on the Norwegian calendar date rather than the browser's. */
	format(isoDate: IsoDate, pattern: string, options?: FormatOptions): string {
		return format(
			toZonedTime(IsoDate.toDate(isoDate), NORWAY_TIMEZONE),
			pattern,
			options,
		);
	},
	/** The date `days` later, or earlier when negative. */
	addDays(isoDate: IsoDate, days: number): IsoDate {
		const date = IsoDate.toDate(isoDate);
		const newDate = addDays(date, days);
		return IsoDate.fromDate(newDate);
	},
};

/** A calendar month, formatted `YYYY-MM`. */
export const IsoMonth = {
	/** Whether the input is a `YYYY-MM` month. */
	isValid(input: string): input is IsoMonth {
		return /^\d{4}-(0[1-9]|1[0-2])$/.test(input);
	},
	/** Brands a `YYYY-MM` string, throwing if it isn't a valid month. */
	parse(input: string): IsoMonth {
		if (!IsoMonth.isValid(input)) {
			throw new Error(`Invalid IsoMonth string: ${input}`);
		}
		return input;
	},
	/** The month from its year and month number (1–12), throwing if invalid. */
	fromParts({ year, month }: { year: number; month: number }): IsoMonth {
		return IsoMonth.parse(`${year}-${String(month).padStart(2, "0")}`);
	},
	/** The year and month number (1–12). */
	toParts(month: IsoMonth): { year: number; month: number } {
		const [year, monthNumber] = month.split("-").map((x) => parseInt(x, 10));
		return { year, month: monthNumber };
	},
	/** The month the date falls in. */
	fromIsoDate(isoDate: IsoDate): IsoMonth {
		return IsoDate.format(isoDate, "yyyy-MM") as IsoMonth;
	},
	/** The month's first day. */
	firstDay(month: IsoMonth): IsoDate {
		return IsoDate.parse(`${month}-01`);
	},
	/** The month's last day. */
	lastDay(month: IsoMonth): IsoDate {
		return IsoDate.addDays(IsoMonth.firstDay(IsoMonth.next(month)), -1);
	},
	/** Every ISO week with a day in the month, in order. */
	weeks(month: IsoMonth): IsoWeek[] {
		const last = IsoWeek.fromIsoDate(IsoMonth.lastDay(month));
		const weeks = [IsoWeek.fromIsoDate(IsoMonth.firstDay(month))];
		while (weeks[weeks.length - 1] !== last)
			weeks.push(IsoWeek.next(weeks[weeks.length - 1]));
		return weeks;
	},
	/** The month after. */
	next(month: IsoMonth): IsoMonth {
		const { year, month: monthNumber } = IsoMonth.toParts(month);
		return monthNumber === 12
			? IsoMonth.fromParts({ year: year + 1, month: 1 })
			: IsoMonth.fromParts({ year, month: monthNumber + 1 });
	},
	/** The month's Norwegian name in lower case: "november". */
	name(month: IsoMonth): string {
		return new Intl.DateTimeFormat("nb-NO", {
			month: "long",
			timeZone: NORWAY_TIMEZONE,
		}).format(IsoDate.toDate(IsoMonth.firstDay(month)));
	},
};

/** Hours in Norwegian, with a decimal comma: "7,5". */
export const formatHours = (hours: number): string =>
	new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(hours);
