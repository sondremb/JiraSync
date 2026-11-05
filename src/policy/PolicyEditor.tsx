import { Heading, Paragraph } from "@digdir/designsystemet-react";
import React from "react";
import { Column } from "../layout/Column";

/** Placeholder: the editor itself is T17 Part A, items 2–5. */
export const PolicyEditor: React.FC<{
	/** The ruleset to edit, or to copy from when `mode` is "new". */
	sourceId: string | undefined;
	mode: "edit" | "new";
}> = ({ sourceId, mode }) => (
	<Column>
		<Heading level={2} data-size="lg">
			{mode === "edit" ? "Rediger regelsett" : "Nytt regelsett"}
		</Heading>
		<Paragraph>
			Redigering er ikke ferdig ennå{sourceId ? ` (${sourceId})` : ""}.
		</Paragraph>
	</Column>
);
