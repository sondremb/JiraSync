import { Heading, Link as DsLink } from "@digdir/designsystemet-react";
import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";
import { Page } from "../layout/Page";
import { Row } from "../layout/Row";
import { UserStatus } from "../layout/UserStatus";
import { BekkEntraLogin } from "../login/bekk/bekkLogin";
import styles from "./PolicyPage.module.css";

/** Login wrapper and chrome shared by all /policy pages. */
export const PolicyPage: React.FC<React.PropsWithChildren> = ({ children }) => (
	<BekkEntraLogin>
		<Page>
			<Row justify="between" align="start">
				<Row className={styles.policyPage__nav}>
					<Heading level={1} data-size="md">
						Jirasync
					</Heading>
					<DsLink asChild>
						<RouterLink to="/">Timeføring</RouterLink>
					</DsLink>
					<DsLink asChild>
						<RouterLink to="/policy">Regler</RouterLink>
					</DsLink>
				</Row>
				<UserStatus />
			</Row>
			{children}
		</Page>
	</BekkEntraLogin>
);
