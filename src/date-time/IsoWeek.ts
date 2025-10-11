import { getISOWeek, getISOWeekYear } from "date-fns";
import { Brand } from "../Utils/brandedTypes";

export type IsoWeek = Brand<string, "IsoWeek">;
type IsoDate = Brand<string, "IsoDate">;

export const IsoWeek = {
	/* 	startOf: (week: IsoWeek): IsoDate => {
		const { year, week: weekNumber } = IsoWeek.parse(week);
		const date = setISOWeek(setISOWeekYear(new Date(), year), weekNumber);
		return IsoDate.fromDate(date);
	},
	days: (week: IsoWeek): IsoDate[] => {
		const start = week.startOf("isoWeek");
	}, */
	parse: (week: IsoWeek): { year: number; week: number } => {
		const [year, weekNumber] = week.split("-").map(Number);
		return { year, week: weekNumber };
	},
	fromDate(date: Date): IsoWeek {
		// always use norwegian timezone
		date = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Oslo" }));
		const week = getISOWeek(date);
		const year = getISOWeekYear(date);
		return `${year}-W${week.toString().padStart(2, "0")}` as IsoWeek;
	},
};
