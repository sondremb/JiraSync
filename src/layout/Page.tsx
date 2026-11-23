import React from "react";
import styles from "./Page.module.css";

interface Props {
	/** Full-width bar above the content, such as `AppBar`. */
	header?: React.ReactNode;
	/** A tinted background, so white cards stand out. */
	tinted?: boolean;
}

export const Page: React.FC<React.PropsWithChildren<Props>> = ({
	header,
	tinted,
	children,
}) => (
	<div
		className={[styles.page, tinted ? styles["page--tinted"] : ""]
			.filter(Boolean)
			.join(" ")}
	>
		{header}
		<div className={styles.page__content}>{children}</div>
	</div>
);
