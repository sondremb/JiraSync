import { Button, Tag } from "@digdir/designsystemet-react";
import { DragVerticalIcon, PencilIcon, TrashIcon } from "@navikt/aksel-icons";
import React from "react";
import { type DraftRule, type RuleErrors } from "../policies/draft";
import {
	projectKeyErrorText,
	timecodeErrorText,
} from "../policies/draftMessages";
import styles from "./PolicyEditor.module.css";

/** Props for the drag handle, from dnd-kit's `useSortable`. */
export type DragHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	ref: (element: HTMLElement | null) => void;
};

/** A closed rule: one read-only line. Open it to edit. */
export const RuleRow: React.FC<{
	rule: DraftRule;
	position: number;
	errors: RuleErrors | undefined;
	/** Project name, if the user can see the project in Jira. */
	projectName: string | undefined;
	/** "code name", if known. */
	timecodeText: string | undefined;
	dragHandle: DragHandleProps;
	onOpen: () => void;
	onRemove: () => void;
}> = ({
	rule,
	position,
	errors,
	projectName,
	timecodeText,
	dragHandle,
	onOpen,
	onRemove,
}) => {
	const { ref, ...handleProps } = dragHandle;
	const projectKey = rule.projectKey.trim();
	const jql = rule.jql.trim();
	return (
		<div className={styles.ruleRow}>
			<button
				ref={ref}
				type="button"
				className={styles.ruleRow__handle}
				aria-label={`Flytt regel ${position}`}
				{...handleProps}
			>
				<DragVerticalIcon aria-hidden />
			</button>
			<button
				type="button"
				className={styles.ruleRow__summary}
				onClick={onOpen}
				aria-label={`Rediger regel ${position}`}
			>
				<span className={styles.ruleRow__position}>{position}</span>
				<span className={styles.ruleRow__project}>
					{projectKey === "" ? (
						"Uten prosjekt"
					) : projectName ? (
						<>
							{projectName} <code>{projectKey}</code>
						</>
					) : (
						<code>{projectKey}</code>
					)}
				</span>
				<code className={styles.ruleRow__jql} title={jql || undefined}>
					{jql || "–"}
				</code>
				<span className={styles.ruleRow__timecode}>
					{rule.timecode === null
						? "Uten timekode"
						: (timecodeText ?? `Timekode ${rule.timecode}`)}
				</span>
			</button>
			<span className={styles.ruleRow__actions}>
				{errors?.projectKey && (
					<Tag data-color="danger" data-size="sm">
						{projectKeyErrorText[errors.projectKey]}
					</Tag>
				)}
				{errors?.timecode && (
					<Tag data-color="danger" data-size="sm">
						{timecodeErrorText[errors.timecode]}
					</Tag>
				)}
				<Button
					icon
					variant="tertiary"
					data-size="sm"
					onClick={onOpen}
					aria-label={`Rediger regel ${position}`}
				>
					<PencilIcon aria-hidden />
				</Button>
				<Button
					icon
					variant="tertiary"
					data-size="sm"
					data-color="danger"
					onClick={onRemove}
					aria-label={`Slett regel ${position}`}
				>
					<TrashIcon aria-hidden />
				</Button>
			</span>
		</div>
	);
};
