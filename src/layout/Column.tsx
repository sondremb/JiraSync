import React from "react";
import styles from "./Column.module.css";
import { classNames } from "../Utils/classNames";

interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
	gap?: "small" | "medium" | "large";
}

export const Column: React.FC<ColumnProps> = ({
	gap = "medium",
	className,
	...rest
}) => {
	const classes = classNames(
		styles.column,
		styles[`column--gap-${gap}`],
		className,
	);
	return <div className={classes} {...rest} />;
};
