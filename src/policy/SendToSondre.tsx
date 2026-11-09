import { Alert, Heading, Paragraph } from "@digdir/designsystemet-react";
import React, { useState } from "react";
import { exportRuleset } from "../policies/draft";
import { type Ruleset } from "../rules";

export type SendStatus = "idle" | "copied" | "failed";

/**
 * "Sending" a ruleset copies its JSON; the user pastes it into a message.
 * The status says what to do next, so a click isn't mistaken for done.
 */
export function useSendRuleset() {
	const [status, setStatus] = useState<SendStatus>("idle");
	const send = (ruleset: Ruleset) =>
		navigator.clipboard.writeText(exportRuleset(ruleset)).then(
			() => setStatus("copied"),
			() => setStatus("failed"),
		);
	return { status, send, reset: () => setStatus("idle") };
}

export const SendStatusMessage: React.FC<{ status: SendStatus }> = ({
	status,
}) => {
	if (status === "copied") {
		return (
			<Alert data-color="success" role="status">
				<Heading level={3} data-size="xs">
					Kopiert, men ikke sendt ennå
				</Heading>
				<Paragraph>
					Lim inn i en melding til Sondre på Slack. Endringene gjelder for alle
					først når de er lagt inn i appen.
				</Paragraph>
			</Alert>
		);
	}
	if (status === "failed") {
		return (
			<Alert data-color="danger" role="status">
				Kunne ikke kopiere. Last ned filen i stedet, og send den til Sondre.
			</Alert>
		);
	}
	return null;
};
