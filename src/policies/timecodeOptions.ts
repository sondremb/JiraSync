import { type TimecodeOption } from "../data/loadTimecodes";

/** "code name", the same text as `TimecodeLabel`. */
export function timecodeLabel(option: Pick<TimecodeOption, "code" | "name">) {
	return `${option.code} ${option.name}`;
}

/** Case-insensitive substring match, for the timecode Combobox `filter`. */
export function matchesTimecode(input: string, label: string): boolean {
	return label.toLowerCase().includes(input.trim().toLowerCase());
}

/** Active timecodes, plus the rule's current timecode even when it is inactive. */
export function isOfferedTimecode(
	option: Pick<TimecodeOption, "id" | "active">,
	currentId: number | null,
): boolean {
	return option.active || option.id === currentId;
}
