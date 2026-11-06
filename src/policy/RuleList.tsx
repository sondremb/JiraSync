import {
	type Announcements,
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@digdir/designsystemet-react";
import { PlusIcon } from "@navikt/aksel-icons";
import React from "react";
import { type DraftRule, type RuleErrors } from "../policies/draft";
import styles from "./PolicyEditor.module.css";
import { RuleEditor } from "./RuleEditor";
import { RuleRow } from "./RuleRow";

export const RuleList: React.FC<{
	rules: readonly DraftRule[];
	/** Stable key per rule, same order as `rules`. Never 0, which dnd-kit treats as no id. */
	ruleKeys: readonly number[];
	openKey: number | null;
	errorsAt: (index: number) => RuleErrors | undefined;
	projectListId: string;
	projectNames: ReadonlyMap<string, string>;
	timecodeTexts: ReadonlyMap<number, string>;
	onOpen: (key: number | null) => void;
	onChange: (index: number, patch: Partial<DraftRule>) => void;
	onInsert: (index: number) => void;
	onRemove: (index: number) => void;
	onMove: (from: number, to: number) => void;
}> = (props) => {
	const { rules, ruleKeys, onInsert, onMove } = props;
	const sensors = useSensors(
		// A small distance, so a click on the handle isn't a drag.
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const indexOf = (id: UniqueIdentifier) => ruleKeys.indexOf(Number(id));
	const announcements = norwegianAnnouncements((id) => indexOf(id) + 1);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (over && active.id !== over.id) {
			onMove(indexOf(active.id), indexOf(over.id));
		}
	};

	if (rules.length === 0) {
		return (
			<Button variant="secondary" onClick={() => onInsert(0)}>
				<PlusIcon aria-hidden /> Legg til regel
			</Button>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			accessibility={{
				announcements,
				screenReaderInstructions: {
					draggable:
						"Trykk mellomrom eller Enter for å ta opp regelen. Flytt den med piltastene, og trykk mellomrom eller Enter for å slippe. Escape avbryter.",
				},
			}}
		>
			<SortableContext
				items={[...ruleKeys]}
				strategy={verticalListSortingStrategy}
			>
				<ol className={styles.policyEditor__rules}>
					{rules.map((rule, index) => (
						<SortableRule
							key={ruleKeys[index]}
							id={ruleKeys[index]}
							rule={rule}
							index={index}
							{...props}
						/>
					))}
				</ol>
				<Button
					variant="secondary"
					className={styles.policyEditor__append}
					onClick={() => onInsert(rules.length)}
				>
					<PlusIcon aria-hidden /> Legg til regel
				</Button>
			</SortableContext>
		</DndContext>
	);
};

const SortableRule: React.FC<
	React.ComponentProps<typeof RuleList> & {
		id: number;
		rule: DraftRule;
		index: number;
	}
> = ({
	id,
	rule,
	index,
	openKey,
	errorsAt,
	projectListId,
	projectNames,
	timecodeTexts,
	onOpen,
	onChange,
	onRemove,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });
	const position = index + 1;
	const errors = errorsAt(index);

	return (
		<li
			ref={setNodeRef}
			// Translate, not Transform: rows differ in height, and scaling would distort them.
			style={{ transform: CSS.Translate.toString(transform), transition }}
			className={
				isDragging ? styles["policyEditor__item--dragging"] : undefined
			}
		>
			{openKey === id ? (
				<RuleEditor
					rule={rule}
					position={position}
					errors={errors}
					projectListId={projectListId}
					actions={{
						change: (patch) => onChange(index, patch),
						remove: () => onRemove(index),
						close: () => onOpen(null),
					}}
				/>
			) : (
				<RuleRow
					rule={rule}
					position={position}
					errors={errors}
					projectName={projectNames.get(rule.projectKey.trim())}
					timecodeText={
						rule.timecode === null
							? undefined
							: timecodeTexts.get(rule.timecode)
					}
					dragHandle={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
					onOpen={() => onOpen(id)}
					onRemove={() => onRemove(index)}
				/>
			)}
		</li>
	);
};

function norwegianAnnouncements(
	position: (id: UniqueIdentifier) => number,
): Announcements {
	return {
		onDragStart: ({ active }) => `Tok opp regel ${position(active.id)}.`,
		onDragOver: ({ active, over }) =>
			over
				? `Regel ${position(active.id)} er over plass ${position(over.id)}.`
				: `Regel ${position(active.id)} er ikke over en plass.`,
		onDragEnd: ({ active, over }) =>
			over
				? `Regel ${position(active.id)} flyttet til plass ${position(over.id)}.`
				: `Regel ${position(active.id)} ble sluppet.`,
		onDragCancel: ({ active }) =>
			`Flytting avbrutt. Regel ${position(active.id)} står på plass ${position(active.id)}.`,
	};
}
