import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Paragraph } from "@digdir/designsystemet-react";
import { Page } from "../layout/Page";

export const Route = createFileRoute("/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Page>
			<Paragraph>🚧 Personvernerklæring kommer 🚧</Paragraph>
		</Page>
	);
}
