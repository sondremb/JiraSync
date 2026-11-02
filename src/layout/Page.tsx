import React from "react";
import styles from "./Page.module.css";

export const Page: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className={styles.page}>
		<div className={styles.page__content}>{children}</div>
	</div>
);
