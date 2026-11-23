/**
 * Joins CSS class names with spaces, skipping falsy ones, so modifiers can be
 * written as `isActive && styles["block--active"]`.
 */
export const classNames = (
	...names: (string | false | null | undefined)[]
): string => names.filter(Boolean).join(" ");
