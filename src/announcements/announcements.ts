import { type IsoDate } from "../date-time/IsoWeek";

export interface Announcement {
	id: string;
	date: IsoDate;
	text: string;
}

/** Shown in the banner on `/`. Newest last. */
export const announcements: Announcement[] = [
	{
		id: "digdir-design",
		date: "2026-11-19" as IsoDate,
		text: "Jirasync har fått nytt utseende og bedre mobilstøtte",
	},
	{
		id: "overtime-signing",
		date: "2026-11-28" as IsoDate,
		text: "Jirasync støtter nå signering av overtid ved slutten av måneden",
	},
];
