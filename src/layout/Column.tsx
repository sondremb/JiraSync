import React from "react";
import styles from "./Column.module.css";

interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
	gap?: "small" | "medium" | "large";
}

export const Column: React.FC<ColumnProps> = ({
	gap = "medium",
	className,
	...rest
}) => {
	const classes = [styles.column, styles[`column--gap-${gap}`], className ?? ""]
		.filter(Boolean)
		.join(" ");
	return <div className={classes} {...rest} />;
};
