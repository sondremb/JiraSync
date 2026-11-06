import {
	Button,
	Field,
	Fieldset,
	Label,
	Paragraph,
	Select,
	Textfield,
	ValidationMessage,
} from "@digdir/designsystemet-react";
import React, { useId } from "react";
import { useProjectComponents } from "../data/useProjectComponents";
import { useJqlSyntax } from "../data/useJqlSyntax";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { type DraftRule, type RuleErrors } from "../policies/draft";
import {
	projectKeyErrorText,
	timecodeErrorText,
} from "../policies/draftMessages";
import { addComponentClause, effectiveJql } from "../policies/editorState";
import styles from "./PolicyEditor.module.css";
import { TimecodePicker } from "./TimecodePicker";

export interface RuleActions {
	change: (patch: Partial<DraftRule>) => void;
	remove: () => void;
	close: () => void;
}

export const RuleEditor: React.FC<{
	rule: DraftRule;
	position: number;
	errors: RuleErrors | undefined;
	/** Datalist id with the user's Jira projects. */
	projectListId: string;
	actions: RuleActions;
}> = ({ rule, position, errors, projectListId, actions }) => {
	const { change } = actions;
	return (
		<Fieldset className={styles.policyEditor__ruleForm}>
			<Fieldset.Legend>Regel {position}</Fieldset.Legend>
			<Row wrap align="start">
				<Textfield
					className={styles.policyEditor__project}
					label="Prosjekt"
					description="Jira-nøkkel, f.eks. ABC"
					value={rule.projectKey}
					list={projectListId}
					autoComplete="off"
					onChange={(e) => change({ projectKey: e.target.value })}
					error={errors?.projectKey && projectKeyErrorText[errors.projectKey]}
				/>
				<div className={styles.policyEditor__timecode}>
					<TimecodePicker
						value={rule.timecode}
						onChange={(timecode) => change({ timecode })}
						error={errors?.timecode && timecodeErrorText[errors.timecode]}
					/>
				</div>
			</Row>
			<JqlField rule={rule} onChange={(jql) => change({ jql })} />
			<Textfield
				label="Kommentar"
				value={rule.comment}
				onChange={(e) => change({ comment: e.target.value })}
			/>
			<Row wrap>
				<Button data-size="sm" onClick={actions.close}>
					Ferdig
				</Button>
				<Button
					variant="tertiary"
					data-size="sm"
					data-color="danger"
					onClick={actions.remove}
				>
					Slett regel
				</Button>
			</Row>
		</Fieldset>
	);
};

const JqlField: React.FC<{
	rule: DraftRule;
	onChange: (jql: string) => void;
}> = ({ rule, onChange }) => {
	const componentSelectId = useId();
	const { data: components } = useProjectComponents(rule.projectKey);
	const syntax = useJqlSyntax(rule.projectKey, rule.jql);
	const fullJql = effectiveJql(rule.projectKey, rule.jql);

	return (
		<Column gap="small">
			<Textfield
				multiline
				rows={2}
				label="JQL (valgfritt)"
				description="Begrenser regelen innenfor prosjektet. Tom betyr hele prosjektet."
				value={rule.jql}
				onChange={(e) => onChange(e.target.value)}
			/>
			{components && components.length > 0 && (
				<Field>
					<Label htmlFor={componentSelectId}>Legg til komponent</Label>
					<Select
						id={componentSelectId}
						width="auto"
						value=""
						onChange={(e) => {
							if (e.target.value) {
								onChange(addComponentClause(rule.jql, e.target.value));
							}
						}}
					>
						<Select.Option value="">Velg komponent …</Select.Option>
						{components.map((component) => (
							<Select.Option key={component.id} value={component.id}>
								{component.name} ({component.id})
							</Select.Option>
						))}
					</Select>
				</Field>
			)}
			{fullJql && (
				<Paragraph data-size="sm">
					Spørringen som kjøres:{" "}
					<code className={styles.policyEditor__jql}>{fullJql}</code>
				</Paragraph>
			)}
			{syntax.data?.ok === true && (
				<ValidationMessage data-color="success">Syntaks OK</ValidationMessage>
			)}
			{syntax.data?.ok === false && (
				<ValidationMessage data-color="warning">
					Syntaksfeil: {syntax.data.errors.join(" ")}
				</ValidationMessage>
			)}
			{syntax.isError && (
				<Paragraph data-size="sm">Kunne ikke sjekke JQL-syntaksen.</Paragraph>
			)}
		</Column>
	);
};
