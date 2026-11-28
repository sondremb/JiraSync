import { IsoMonth, IsoWeek } from "../date-time/IsoWeek";
import type { MonthReview, OutOfSyncWeek } from "../reconciliation/monthReview";
import { capitalize } from "../Utils/capitalize";
import type { StatusTone } from "./TimeTable/StatusMark";

/** Plain text, or a week number that shows that week when clicked. */
export type MessagePart = string | { week: IsoWeek; text: string };

export interface MonthReviewMessage {
	tone: Extract<StatusTone, "success" | "danger">;
	/** What the month's status is, in bold. */
	title: string;
	/** The details after the title, if any. */
	parts: MessagePart[];
}

/**
 * "uke 44 og 46", "uke 44, denne uken og uke 47": each week number links to
 * its week, the viewed week is "denne uken" without a link.
 */
function weekList(weeks: readonly OutOfSyncWeek[]): MessagePart[] {
	const parts: MessagePart[] = [];
	weeks.forEach((entry, index) => {
		if (index > 0) parts.push(index === weeks.length - 1 ? " og " : ", ");
		if (entry.viewed) {
			parts.push("denne uken");
			return;
		}
		if (index === 0 || weeks[index - 1].viewed) parts.push("uke ");
		parts.push({
			week: entry.week,
			text: String(IsoWeek.toParts(entry.week).week),
		});
	});
	return mergeText(parts);
}

/** Joins neighbouring text parts, so "uke " and ", " read as one string. */
function mergeText(parts: MessagePart[]): MessagePart[] {
	const merged: MessagePart[] = [];
	for (const part of parts) {
		const previous = merged[merged.length - 1];
		if (typeof part === "string" && typeof previous === "string")
			merged[merged.length - 1] = previous + part;
		else merged.push(part);
	}
	return merged;
}

/** Capitalises the first text part, which starts a sentence. */
function capitalizeFirst(parts: MessagePart[]): MessagePart[] {
	const [first, ...rest] = parts;
	return typeof first === "string" ? [capitalize(first), ...rest] : parts;
}

/**
 * The line under the status card: a headline ("Hele november stemmer",
 * "November stemmer ikke", "Kunne ikke sjekke november") and, for a month out
 * of sync, the weeks to check. Locked weeks are listed with the rest, since
 * the mismatch is the problem, and then noted as needing unlocking first.
 */
export function monthReviewMessage(
	review: MonthReview | null,
): MonthReviewMessage | null {
	if (review === null) return null;
	const name = IsoMonth.name(review.month);
	switch (review.kind) {
		case "error":
			return { tone: "danger", title: `Kunne ikke sjekke ${name}`, parts: [] };
		case "inSync":
			return { tone: "success", title: `Hele ${name} stemmer`, parts: [] };
		case "outOfSync": {
			const parts: MessagePart[] = ["Sjekk ", ...weekList(review.weeks), "."];
			const locked = review.weeks.filter((week) => week.locked);
			if (locked.length > 0) {
				const pronoun = locked.length === 1 ? "den" : "de";
				parts.push(
					" ",
					...capitalizeFirst(weekList(locked)),
					` er låst, så ${pronoun} må låses opp først.`,
				);
			}
			return {
				tone: "danger",
				title: `${capitalize(name)} stemmer ikke`,
				parts: mergeText(parts),
			};
		}
	}
}
