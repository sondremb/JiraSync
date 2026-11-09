import { Dialog, Heading } from "@digdir/designsystemet-react";
import React from "react";
import { Column } from "../layout/Column";
import { RulesetSelector } from "./RulesetSelector";

export const RulesetModal: React.FC = () => (
	<Dialog.TriggerContext>
		<Dialog.Trigger variant="secondary">Velg regler</Dialog.Trigger>
		<Dialog closedby="any">
			<Column>
				<Heading level={2} data-size="sm">
					Velg regler
				</Heading>
				<RulesetSelector />
			</Column>
		</Dialog>
	</Dialog.TriggerContext>
);
