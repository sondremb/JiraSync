import {
	Alert,
	Button,
	Dialog,
	Heading,
	Link as DsLink,
	Paragraph,
	Textfield,
} from "@digdir/designsystemet-react";
import { Link as RouterLink, useNavigate } from "@tanstack/react-router";
import React, { useId, useRef, useState } from "react";
import { useJiraProjects } from "../data/useJiraProjects";
import { useTimecodesByIds } from "../data/useTimecodesByIds";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { type CatalogEntry, findEntry } from "../policies/catalog";
import {
	type DraftRuleset,
	deleteRule,
	exportRuleset,
	insertRule,
	moveRule,
	toRuleset,
	updateMeta,
	updateRule,
	validateDraft,
} from "../policies/draft";
import {
	idErrorText,
	nameErrorText,
	rulesErrorText,
} from "../policies/draftMessages";
import {
	type EditorMode,
	exportFileName,
	firstInvalidRule,
	initialDraft,
	takenIds,
} from "../policies/editorState";
import { timecodeLabel } from "../policies/timecodeOptions";
import { useDeleteDraft, useSaveDraft } from "../policies/useDrafts";
import { type Ruleset } from "../rules";
import { usePolicyCatalog } from "../policies/usePolicyCatalog";
import { PolicyKindTags } from "./PolicyKindTag";
import { RuleList } from "./RuleList";

export const PolicyEditor: React.FC<{
	/** The ruleset to edit, or to copy from when `mode` is "new". */
	sourceId: string | undefined;
	mode: EditorMode;
}> = ({ sourceId, mode }) => {
	const catalog = usePolicyCatalog();
	const source =
		sourceId === undefined ? undefined : findEntry(catalog, sourceId);

	if (sourceId !== undefined && !source) {
		return (
			<Column>
				<Heading level={2} data-size="lg">
					Fant ikke regelsettet
				</Heading>
				<Paragraph>Det finnes ingen regler med id «{sourceId}».</Paragraph>
				<DsLink asChild>
					<RouterLink to="/policy/all">Tilbake til alle regelsett</RouterLink>
				</DsLink>
			</Column>
		);
	}

	// Remount when the source changes, so the form starts over from it.
	return (
		<DraftForm
			key={`${mode}-${sourceId ?? ""}`}
			mode={mode}
			source={source}
			taken={takenIds(catalog, mode, sourceId)}
		/>
	);
};

const DraftForm: React.FC<{
	mode: EditorMode;
	source: CatalogEntry | undefined;
	taken: ReadonlySet<string>;
}> = ({ mode, source, taken }) => {
	const navigate = useNavigate();
	const projectListId = useId();
	const { data: projects } = useJiraProjects();
	const saveDraft = useSaveDraft();

	const [draft, setDraft] = useState(() => initialDraft(mode, source));
	// Stable keys per rule (from 1; dnd-kit treats 0 as no id), so moving
	// rules keeps each field's own state.
	const nextKey = useRef(draft.rules.length + 1);
	const [ruleKeys, setRuleKeys] = useState(() =>
		draft.rules.map((_, i) => i + 1),
	);
	// One rule is open for editing at a time. A new, empty ruleset starts with its rule open.
	const [openKey, setOpenKey] = useState<number | null>(() =>
		mode === "new" && !source ? 1 : null,
	);
	const { data: timecodes } = useTimecodesByIds(
		draft.rules.flatMap((rule) =>
			rule.timecode === null ? [] : [rule.timecode],
		),
	);
	const [showErrors, setShowErrors] = useState(false);
	const [copied, setCopied] = useState(false);

	const validation = validateDraft(draft, taken);
	const errorsVisible = showErrors && !validation.valid;

	const edit = (change: (d: DraftRuleset) => DraftRuleset) => {
		setDraft(change);
		setCopied(false);
	};
	const insertAt = (index: number) => {
		const key = nextKey.current++;
		edit((d) => insertRule(d, index));
		setRuleKeys((keys) => keys.toSpliced(index, 0, key));
		setOpenKey(key);
	};
	const removeAt = (index: number) => {
		const key = ruleKeys[index];
		edit((d) => deleteRule(d, index));
		setRuleKeys((keys) => keys.toSpliced(index, 1));
		setOpenKey((open) => (open === key ? null : open));
	};
	const move = (from: number, to: number) => {
		edit((d) => moveRule(d, from, to));
		setRuleKeys((keys) => keys.toSpliced(from, 1).toSpliced(to, 0, keys[from]));
	};

	/** Runs `action` with the finished ruleset, or reveals the errors. */
	const withValidRuleset = (action: (ruleset: Ruleset) => void) => {
		if (!validation.valid) {
			setShowErrors(true);
			const invalid = firstInvalidRule(validation);
			if (invalid !== undefined) {
				setOpenKey(ruleKeys[invalid]);
			}
			return;
		}
		action(toRuleset(draft));
	};

	const save = () =>
		withValidRuleset((ruleset) =>
			saveDraft.mutate(ruleset, {
				onSuccess: () =>
					navigate({ to: "/policy/$id", params: { id: ruleset.id } }),
			}),
		);

	const download = () =>
		withValidRuleset((ruleset) => {
			const url = URL.createObjectURL(
				new Blob([exportRuleset(ruleset)], { type: "application/json" }),
			);
			const link = document.createElement("a");
			link.href = url;
			link.download = exportFileName(ruleset.id);
			link.click();
			URL.revokeObjectURL(url);
		});

	const copy = () =>
		withValidRuleset((ruleset) => {
			navigator.clipboard.writeText(exportRuleset(ruleset)).then(
				() => setCopied(true),
				() => setCopied(false),
			);
		});

	return (
		<Column gap="large">
			<Column gap="small">
				<DsLink asChild>
					{source ? (
						<RouterLink to="/policy/$id" params={{ id: source.ruleset.id }}>
							← {source.ruleset.name}
						</RouterLink>
					) : (
						<RouterLink to="/policy/all">← Alle regelsett</RouterLink>
					)}
				</DsLink>
				<Row wrap>
					<Heading level={2} data-size="lg">
						{mode === "edit" ? "Rediger regelsett" : "Nytt regelsett"}
					</Heading>
					{mode === "edit" && source && <PolicyKindTags entry={source} />}
				</Row>
			</Column>

			<Alert data-color="info">
				<Heading level={3} data-size="xs">
					Endringene blir ikke tatt i bruk automatisk
				</Heading>
				<Paragraph>
					Et lagret utkast finnes bare i denne nettleseren. For at endringene
					skal gjelde for alle, last ned eller kopier JSON og send den til
					Sondre.
				</Paragraph>
			</Alert>

			<Column>
				{mode === "new" ? (
					<Textfield
						label="Id"
						description="Små bokstaver, tall og bindestrek. Kan ikke endres senere."
						value={draft.id}
						onChange={(e) => edit((d) => updateMeta(d, { id: e.target.value }))}
						error={errorsVisible && validation.id && idErrorText[validation.id]}
					/>
				) : (
					<Paragraph>
						Id: <code>{draft.id}</code>
					</Paragraph>
				)}
				<Textfield
					label="Navn"
					value={draft.name}
					onChange={(e) => edit((d) => updateMeta(d, { name: e.target.value }))}
					error={
						errorsVisible && validation.name && nameErrorText[validation.name]
					}
				/>
				<Textfield
					multiline
					rows={2}
					label="Beskrivelse (valgfritt)"
					value={draft.description}
					onChange={(e) =>
						edit((d) => updateMeta(d, { description: e.target.value }))
					}
				/>
			</Column>

			<Column>
				<Heading level={3} data-size="md">
					Regler
				</Heading>
				<Paragraph data-size="sm">
					Reglene gjelder i rekkefølge: den første som passer, vinner.
				</Paragraph>
				<datalist id={projectListId}>
					{projects?.map((project) => (
						<option key={project.key} value={project.key}>
							{project.name}
						</option>
					))}
				</datalist>
				<RuleList
					rules={draft.rules}
					ruleKeys={ruleKeys}
					openKey={openKey}
					errorsAt={(index) =>
						errorsVisible ? validation.ruleErrors[index] : undefined
					}
					projectListId={projectListId}
					projectNames={
						new Map(projects?.map((project) => [project.key, project.name]))
					}
					timecodeTexts={
						new Map(
							[...(timecodes?.values() ?? [])].map((option) => [
								option.id,
								timecodeLabel(option),
							]),
						)
					}
					onOpen={setOpenKey}
					onChange={(index, patch) => edit((d) => updateRule(d, index, patch))}
					onInsert={insertAt}
					onRemove={removeAt}
					onMove={move}
				/>
			</Column>

			{errorsVisible && (
				<Alert data-color="danger">
					{validation.rules
						? rulesErrorText[validation.rules]
						: "Rett feilene som er markert over før du lagrer eller eksporterer."}
				</Alert>
			)}
			{saveDraft.isError && (
				<Alert data-color="danger">
					Kunne ikke lagre utkastet i nettleseren.
				</Alert>
			)}

			<Row wrap>
				<Button onClick={save} disabled={saveDraft.isPending}>
					Lagre utkast
				</Button>
				<Button variant="secondary" onClick={download}>
					Last ned JSON
				</Button>
				<Button variant="secondary" onClick={copy}>
					Kopier JSON
				</Button>
				{copied && (
					<Paragraph data-size="sm" role="status">
						Kopiert til utklippstavlen.
					</Paragraph>
				)}
			</Row>

			{mode === "edit" && source && (
				<Row wrap>
					<DsLink asChild>
						<RouterLink to="/policy/new" search={{ from: source.ruleset.id }}>
							Lagre som kopi (ulagrede endringer blir ikke med)
						</RouterLink>
					</DsLink>
					{source.kind !== "bundled" && <DeleteDraft entry={source} />}
				</Row>
			)}
		</Column>
	);
};

const DeleteDraft: React.FC<{ entry: CatalogEntry }> = ({ entry }) => {
	const navigate = useNavigate();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const deleteDraft = useDeleteDraft();
	const { id } = entry.ruleset;
	const isEditedCopy = entry.kind === "edited";

	return (
		<Dialog.TriggerContext>
			<Dialog.Trigger variant="tertiary" data-color="danger">
				{isEditedCopy ? "Forkast redigert kopi" : "Slett utkast"}
			</Dialog.Trigger>
			<Dialog ref={dialogRef} closedby="any">
				<Column>
					<Heading level={2} data-size="sm">
						{isEditedCopy
							? "Forkaste den redigerte kopien?"
							: "Slette utkastet?"}
					</Heading>
					<Paragraph>
						{isEditedCopy
							? "Du går tilbake til regelsettet slik det ligger i appen."
							: "Utkastet slettes fra denne nettleseren. Det kan ikke angres."}
					</Paragraph>
					<Row>
						<Button
							data-color="danger"
							disabled={deleteDraft.isPending}
							onClick={() =>
								deleteDraft.mutate(id, {
									onSuccess: () => {
										dialogRef.current?.close();
										if (isEditedCopy) {
											navigate({ to: "/policy/$id", params: { id } });
										} else {
											navigate({ to: "/policy/all" });
										}
									},
								})
							}
						>
							{isEditedCopy ? "Forkast" : "Slett"}
						</Button>
						<Button
							variant="secondary"
							onClick={() => dialogRef.current?.close()}
						>
							Avbryt
						</Button>
					</Row>
				</Column>
			</Dialog>
		</Dialog.TriggerContext>
	);
};
