import { Tag } from "@digdir/designsystemet-react";
import React from "react";
import { type CatalogEntry } from "../policies/catalog";

export const PolicyKindTags: React.FC<{ entry: CatalogEntry }> = ({
	entry,
}) => (
	<>
		{entry.isSelected && (
			<Tag data-color="accent" data-size="sm">
				dine regler
			</Tag>
		)}
		{entry.kind === "draft" && (
			<Tag data-color="neutral" data-size="sm">
				kladd
			</Tag>
		)}
		{entry.kind === "edited" && (
			<Tag data-color="neutral" data-size="sm">
				redigert kopi
			</Tag>
		)}
	</>
);
