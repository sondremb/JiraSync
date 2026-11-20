import { Heading } from "@digdir/designsystemet-react";
import React from "react";
import { RulesetSelector } from "./components/RulesetSelector";
import { useRuleSet } from "./data/useRuleset";
import { HoursLegend, HoursLegendHelp } from "./components/TimeTable/HoursBox";
import { Page } from "./layout/Page";
import { Row } from "./layout/Row";
import { UserMenu } from "./layout/UserMenu";
import { UserStatus } from "./layout/UserStatus";
import styles from "./RulesetWrapper.module.css";

export const RulesetWrapper: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { selectedRuleset } = useRuleSet();

	return (
		<Page>
			<header className={styles.rulesetWrapper__header}>
				<Row className={styles.rulesetWrapper__brand}>
					<Heading
						level={1}
						data-size="xl"
						className={styles.rulesetWrapper__title}
					>
						Jirasync
					</Heading>
					<div className={styles["rulesetWrapper__wide"]}>
						<HoursLegend />
					</div>
					<HoursLegendHelp className={styles["rulesetWrapper__narrow"]} />
				</Row>
				<div className={styles["rulesetWrapper__wide"]}>
					<UserStatus />
				</div>
				<UserMenu className={styles["rulesetWrapper__narrow"]} />
			</header>
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
