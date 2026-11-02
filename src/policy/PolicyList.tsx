import {
	Card,
	Heading,
	Link as DsLink,
	Paragraph,
} from "@digdir/designsystemet-react";
import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { usePolicyCatalog } from "../policies/usePolicyCatalog";
import { PolicyKindTags } from "./PolicyKindTag";
import styles from "./PolicyList.module.css";

export const PolicyList: React.FC = () => {
	const catalog = usePolicyCatalog();
	return (
		<Column gap="large">
			<Heading level={2} data-size="lg">
				Regelsett
			</Heading>
			<ul className={styles.policyList}>
				{catalog.map((entry) => (
					<li key={entry.ruleset.id} className={styles.policyList__item}>
						<Card data-color={entry.isSelected ? "accent" : "neutral"}>
							<Column gap="small">
								<Row wrap>
									<Heading level={3} data-size="sm">
										<DsLink asChild>
											<RouterLink
												to="/policy/$id"
												params={{ id: entry.ruleset.id }}
											>
												{entry.ruleset.name}
											</RouterLink>
										</DsLink>
									</Heading>
									<PolicyKindTags entry={entry} />
								</Row>
								{entry.ruleset.description && (
									<Paragraph>{entry.ruleset.description}</Paragraph>
								)}
								<Paragraph data-size="sm">
									{entry.ruleset.rules.length} regler
								</Paragraph>
							</Column>
						</Card>
					</li>
				))}
			</ul>
		</Column>
	);
};
