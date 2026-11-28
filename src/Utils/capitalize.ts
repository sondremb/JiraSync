/** The text with its first letter in upper case: "november" → "November". */
export const capitalize = (text: string): string =>
	text.charAt(0).toUpperCase() + text.slice(1);
