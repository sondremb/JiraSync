import {
	Heading,
	Link as DsLink,
	Paragraph,
	Table,
} from "@digdir/designsystemet-react";
import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";
import { useJiraProjects } from "../data/useJiraProjects";
import { useTimecodesByIds } from "../data/useTimecodesByIds";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { findEntry } from "../policies/catalog";
import { usePolicyCatalog } from "../policies/usePolicyCatalog";
import { PolicyKindTags } from "./PolicyKindTag";
import styles from "./PolicyDetail.module.css";

export const PolicyDetail: React.FC<{ id: string }> = ({ id }) => {
	const catalog = usePolicyCatalog();
	const entry = findEntry(catalog, id);
	const { data: projects } = useJiraProjects();
	const { data: timecodes } = useTimecodesByIds(
		entry?.ruleset.rules.map((rule) => rule.timecode) ?? [],
	);

	if (!entry) {
		return (
			<Column>
				<Heading level={2} data-size="lg">
					Fant ikke regelsettet
				</Heading>
				<Paragraph>Det finnes ingen regler med id «{id}».</Paragraph>
				<DsLink asChild>
					<RouterLink to="/policy/all">Tilbake til alle regelsett</RouterLink>
				</DsLink>
			</Column>
		);
	}

	const { ruleset } = entry;
	const projectNames = new Map(projects?.map((p) => [p.key, p.name]));

	return (
		<Column gap="large">
			<Column gap="small">
				<DsLink asChild>
					<RouterLink to="/policy/all">← Alle regelsett</RouterLink>
				</DsLink>
				<Row wrap>
					<Heading level={2} data-size="lg">
						{ruleset.name}
					</Heading>
					<PolicyKindTags entry={entry} />
				</Row>
				{ruleset.description && <Paragraph>{ruleset.description}</Paragraph>}
				<Paragraph data-size="sm">
					Reglene gjelder i rekkefølge: den første som passer, vinner.
				</Paragraph>
			</Column>
			<Table zebra>
				<Table.Head>
					<Table.Row>
						<Table.HeaderCell>#</Table.HeaderCell>
						<Table.HeaderCell>Prosjekt</Table.HeaderCell>
						<Table.HeaderCell>JQL</Table.HeaderCell>
						<Table.HeaderCell>Timekode</Table.HeaderCell>
						<Table.HeaderCell>Kommentar</Table.HeaderCell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{ruleset.rules.map((rule, index) => {
						const projectName = projectNames.get(rule.projectKey);
						const timecode = timecodes?.get(rule.timecode);
						return (
							<Table.Row key={index}>
								<Table.Cell>{index + 1}</Table.Cell>
								<Table.Cell>
									{projectName ? (
										<>
											{projectName} <code>{rule.projectKey}</code>
										</>
									) : (
										<code title="Navnet er ikke tilgjengelig, enten fordi prosjektet ikke finnes eller fordi du ikke har tilgang.">
											{rule.projectKey}
										</code>
									)}
								</Table.Cell>
								<Table.Cell>
									{rule.jql ? (
										<code className={styles.policyDetail__jql}>{rule.jql}</code>
									) : (
										"–"
									)}
								</Table.Cell>
								<Table.Cell>
									{timecode
										? `${timecode.code} ${timecode.name}`
										: `Timekode ${rule.timecode}`}
								</Table.Cell>
								<Table.Cell>{rule.comment ?? ""}</Table.Cell>
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table>
		</Column>
	);
};
