import React, { useState } from "react";
import {
	Alert,
	Button,
	Card,
	Chip,
	Dialog,
	Fieldset,
	Heading,
	Label,
	Paragraph,
	Spinner,
} from "@digdir/designsystemet-react";
import { formatHours, type IsoMonth } from "../date-time/IsoWeek";
import { useOvertimeSummary } from "../data/useOvertimeSummary";
import {
	chosenFlexHours,
	overtimeOutcome,
	splitStep,
	type OvertimeChoice,
	type OvertimeSummary,
	type SignedOvertime,
} from "../overtime/overtime";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { classNames } from "../Utils/classNames";
import { overtimeDialogTitle } from "./lockMessages";
import styles from "./OvertimeDialog.module.css";

interface Props {
	/** The month to sign; open while set. */
	month: IsoMonth | null;
	locking: boolean;
	lockError: Error | null;
	onConfirm: (signed: SignedOvertime) => void;
	onClose: () => void;
}

/** Signs the overtime of the month a lock closes, then locks. Modelled on Timekeeper's dialog. */
export const OvertimeDialog: React.FC<Props> = ({ month, ...props }) => (
	<Dialog
		open={month !== null}
		onClose={props.onClose}
		closedby={props.locking ? "none" : "any"}
		closeButton={props.locking ? false : undefined}
	>
		{month && <OvertimeDialogBody month={month} {...props} />}
	</Dialog>
);

type BodyProps = Omit<Props, "month">;

const OvertimeDialogBody: React.FC<BodyProps & { month: IsoMonth }> = ({
	month,
	...props
}) => {
	const summary = useOvertimeSummary(month);
	if (summary.data) {
		return (
			<OvertimeSigningForm
				key={summary.data.month}
				summary={summary.data}
				{...props}
			/>
		);
	}
	if (summary.error) {
		return (
			<Column>
				<Alert data-color="danger">
					Kunne ikke hente overtid: {summary.error.message}
				</Alert>
				<Row>
					<Button variant="secondary" onClick={props.onClose}>
						Lukk
					</Button>
				</Row>
			</Column>
		);
	}
	return <Spinner aria-label="Henter overtid" />;
};

type ChoiceKind = OvertimeChoice["kind"];
const choiceLabels: Record<ChoiceKind, string> = {
	payout: "Utbetalt",
	flex: "Fleksitid",
	split: "Fordel selv",
};

const OvertimeSigningForm: React.FC<
	BodyProps & { summary: OvertimeSummary }
> = ({ summary, locking, lockError, onConfirm, onClose }) => {
	const [choice, setChoice] = useState<OvertimeChoice>({ kind: "payout" });
	const outcome = overtimeOutcome(summary, choice);
	const flexHours = chosenFlexHours(choice, summary.allocatable);
	const choose = (kind: ChoiceKind) =>
		setChoice(kind === "split" ? { kind, flexHours } : { kind });

	return (
		<Column>
			<Heading level={2} data-size="sm">
				{overtimeDialogTitle(summary)}
			</Heading>
			<dl className={styles.overtimeDialog__hours}>
				<div className={styles.overtimeDialog__row}>
					<dt>Overtid</dt>
					<dd>{formatHours(summary.overtimeHours)} t</dd>
				</div>
				<div
					className={classNames(
						styles.overtimeDialog__row,
						styles["overtimeDialog__row--part"],
					)}
				>
					<dt>Fleksitid du skylder</dt>
					<dd>{formatHours(summary.mandatoryFlex)} t</dd>
				</div>
				<div
					className={classNames(
						styles.overtimeDialog__row,
						styles["overtimeDialog__row--part"],
					)}
				>
					<dt>Må utbetales</dt>
					<dd>{formatHours(summary.mandatoryPayout)} t</dd>
				</div>
				<div className={styles.overtimeDialog__row}>
					<dt>Valgfri overtid</dt>
					<dd>{formatHours(summary.allocatable)} t</dd>
				</div>
			</dl>
			{summary.allocatable > 0 && (
				<Fieldset>
					<Fieldset.Legend>
						Hvordan vil du få den valgfrie overtiden?
					</Fieldset.Legend>
					<Row wrap>
						{(Object.keys(choiceLabels) as ChoiceKind[]).map((kind) => (
							<Chip.Radio
								key={kind}
								name="overtime-choice"
								value={kind}
								checked={choice.kind === kind}
								disabled={locking}
								onChange={() => choose(kind)}
							>
								{choiceLabels[kind]}
							</Chip.Radio>
						))}
					</Row>
				</Fieldset>
			)}
			{summary.allocatable > 0 && choice.kind === "split" && (
				<Column gap="small">
					<Row justify="between">
						<Label htmlFor="overtime-flex">Fleksitid</Label>
						<strong>{formatHours(flexHours)} t</strong>
					</Row>
					<input
						id="overtime-flex"
						type="range"
						className={styles.overtimeDialog__slider}
						min={0}
						max={summary.allocatable}
						step={splitStep(summary.allocatable)}
						value={flexHours}
						disabled={locking}
						onChange={(event) =>
							setChoice({
								kind: "split",
								flexHours: Number(event.target.value),
							})
						}
					/>
				</Column>
			)}
			<section aria-labelledby="overtime-result">
				<Heading id="overtime-result" level={3} data-size="xs">
					Resultat
				</Heading>
				<Row align="start" wrap className={styles.overtimeDialog__result}>
					<Card data-variant="tinted" className={styles.overtimeDialog__card}>
						<Paragraph data-size="sm">Utbetales</Paragraph>
						<strong>{formatHours(outcome.payoutHours)} t</strong>
					</Card>
					<Card data-variant="tinted" className={styles.overtimeDialog__card}>
						<Paragraph data-size="sm">Fleksikonto</Paragraph>
						<strong>{formatHours(outcome.flexBalanceHours)} t</strong>
					</Card>
				</Row>
			</section>
			{summary.halfYearClearing && (
				<Paragraph data-size="sm">
					Halvårsoppgjør av fleksitid:{" "}
					{formatHours(summary.halfYearClearing.payoutHours)} t utbetales og{" "}
					{formatHours(summary.halfYearClearing.deletedHours)} t slettes, i
					tillegg til overtiden over.
				</Paragraph>
			)}
			{lockError && (
				<Alert data-color="danger">Kunne ikke låse: {lockError.message}</Alert>
			)}
			<Row>
				<Button loading={locking} onClick={() => onConfirm(outcome.signed)}>
					{locking ? "Låser timer…" : "Bekreft og lås timer"}
				</Button>
				<Button variant="secondary" disabled={locking} onClick={onClose}>
					Avbryt
				</Button>
			</Row>
		</Column>
	);
};
