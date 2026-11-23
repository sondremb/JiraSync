import React from "react";
import styles from "./Row.module.css";
import { classNames } from "../Utils/classNames";

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: "start" | "center" | "end";
	justify?: "start" | "center" | "between" | "end";
	wrap?: boolean;
}

export const Row: React.FC<RowProps> = ({
	align = "center",
	justify = "start",
	wrap = false,
	className,
	...rest
}) => {
	const classes = classNames(
		styles.row,
		styles[`row--align-${align}`],
		styles[`row--justify-${justify}`],
		wrap && styles["row--wrap"],
		className,
	);
	return <div className={classes} {...rest} />;
};
