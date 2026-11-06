import React from "react";
import styles from "./Row.module.css";

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: "start" | "center" | "end";
	justify?: "start" | "between" | "end";
	wrap?: boolean;
}

export const Row: React.FC<RowProps> = ({
	align = "center",
	justify = "start",
	wrap = false,
	className,
	...rest
}) => {
	const classes = [
		styles.row,
		styles[`row--align-${align}`],
		styles[`row--justify-${justify}`],
		wrap ? styles["row--wrap"] : "",
		className ?? "",
	]
		.filter(Boolean)
		.join(" ");
	return <div className={classes} {...rest} />;
};
