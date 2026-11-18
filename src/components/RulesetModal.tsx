import { Dialog, Heading } from "@digdir/designsystemet-react";
import React from "react";
import { Column } from "../layout/Column";
import { RulesetSelector } from "./RulesetSelector";

const Content: React.FC = () => (
	<Column>
		<Heading level={2} data-size="sm">
			Velg regler
		</Heading>
		<RulesetSelector />
	</Column>
);

/** A "Velg regler" button that opens the ruleset picker. */
export const RulesetModal: React.FC = () => (
	<Dialog.TriggerContext>
		<Dialog.Trigger variant="secondary">Velg regler</Dialog.Trigger>
		<Dialog closedby="any">
			<Content />
		</Dialog>
	</Dialog.TriggerContext>
);

/** The ruleset picker, opened from elsewhere, such as the user menu. */
export const RulesetDialog: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({ open, onClose }) => (
	<Dialog open={open} onClose={onClose} closedby="any">
		<Content />
	</Dialog>
);
