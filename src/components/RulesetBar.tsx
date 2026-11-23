import {
	Button,
	Link as DsLink,
	Paragraph,
	Tag,
} from "@digdir/designsystemet-react";
import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";
import { useRuleSet } from "../data/useRuleset";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { type CatalogEntry } from "../policies/catalog";
import { SendStatusMessage, useSendRuleset } from "../policy/SendToSondre";
import styles from "./RulesetBar.module.css";

/**
 * A local ruleset only works for this user, so say so where its effect is
 * seen. The ruleset name and picker are in the `AppBar`; a bundled ruleset
 * needs nothing more.
 *
 * Narrow screens show only a one-line warning.
 */
export const RulesetBar: React.FC = () => {
	const { entries } = useRuleSet();
	const selected = entries.find((entry) => entry.isSelected);
	if (!selected || selected.kind === "bundled") return null;
	return (
		<>
			<div className={styles.rulesetBar}>
				<LocalSummary entry={selected} />
			</div>
			<div className={styles.rulesetBar__compact}>
				<Tag data-color="warning" data-size="sm">
					{selected.kind === "edited" ? "Endrede regler" : "Lokale regler"}
				</Tag>
				<Paragraph data-size="sm">
					<strong>{selected.ruleset.name}</strong> gjelder bare hos deg.{" "}
					<DsLink asChild>
						<RouterLink to="/policy/$id" params={{ id: selected.ruleset.id }}>
							Se regelsett
						</RouterLink>
					</DsLink>
				</Paragraph>
			</div>
		</>
	);
};

const LocalSummary: React.FC<{ entry: CatalogEntry }> = ({ entry }) => {
	const { ruleset, kind } = entry;
	const sending = useSendRuleset();
	return (
		<Column gap="small">
			<Row wrap>
				<Paragraph>
					Regler: <strong>{ruleset.name}</strong>
				</Paragraph>
				<Tag data-color="warning" data-size="sm">
					{kind === "edited" ? "endret, bare hos deg" : "bare hos deg"}
				</Tag>
			</Row>
			<Row wrap>
				<Paragraph data-size="sm">
					{kind === "edited"
						? "Endringene gjelder bare deg til Sondre har lagt dem inn. Når de er lagt inn, kan du forkaste kopien din."
						: "Regelsettet gjelder bare deg til Sondre har lagt det inn."}
				</Paragraph>
				<Button
					variant="secondary"
					data-size="sm"
					onClick={() => sending.send(ruleset)}
				>
					Send til Sondre
				</Button>
				<DsLink asChild data-size="sm">
					<RouterLink to="/policy/$id" params={{ id: ruleset.id }}>
						Se regelsett
					</RouterLink>
				</DsLink>
			</Row>
			<SendStatusMessage status={sending.status} />
		</Column>
	);
};
