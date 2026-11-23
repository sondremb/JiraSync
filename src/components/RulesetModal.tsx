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

/** The ruleset picker, opened from the `AppBar`. */
export const RulesetDialog: React.FC<{
	open: boolean;
	onClose: () => void;
}> = ({ open, onClose }) => (
	<Dialog open={open} onClose={onClose} closedby="any">
		<Content />
	</Dialog>
);
