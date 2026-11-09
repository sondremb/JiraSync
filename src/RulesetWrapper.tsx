import { Heading } from "@digdir/designsystemet-react";
import React from "react";
import { RulesetSelector } from "./components/RulesetSelector";
import { useRuleSet } from "./data/useRuleset";
import { HoursLegend } from "./components/TimeTable/HoursBox";
import { Page } from "./layout/Page";
import { Row } from "./layout/Row";
import { UserStatus } from "./layout/UserStatus";
import styles from "./RulesetWrapper.module.css";

export const RulesetWrapper: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { selectedRuleset } = useRuleSet();

	return (
		<Page>
			<Row justify="between" align="start">
				<Row className={styles.rulesetWrapper__brand}>
					<Heading level={1} data-size="xl">
						Jirasync
					</Heading>
					<HoursLegend />
				</Row>
				<UserStatus />
			</Row>
			{selectedRuleset ? (
				children
			) : (
				<>
					<Heading level={2} data-size="md">
						Velg regler
					</Heading>
					<RulesetSelector />
				</>
			)}
		</Page>
	);
};
