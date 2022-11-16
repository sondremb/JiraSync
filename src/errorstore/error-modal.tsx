import { H2, Link, Modal, Text } from "@udir/lisa";
import React from "react";
import { ErrorStoreError, resetErrorAction } from "./errors";
import { useErrorStore } from "./store";

export const ErrorModal: React.FC = () => {
	const { state, dispatch } = useErrorStore();
	return (
		<Modal
			showModal={state.error !== null}
			onCancel={() => dispatch(resetErrorAction)}
		>
			<RenderError error={state.error} />
		</Modal>
	);
};

interface ErrorProps {
	error: ErrorStoreError | null;
}

const RenderError: React.FC<ErrorProps> = ({ error }) => {
	if (error === null) {
		return (
			<Text>
				Det ligger ingen error i systemet, så denne dialogen burde ikke være
				synlig.
			</Text>
		);
	}
	switch (error.kind) {
		case "JIRA_CAPTCHA":
			return (
				<>
					<H2>Midlertidig utestengt</H2>
					<Text>
						På grunn av feilede innlogginsforsøk er brukeren din midlertidig
						sperret fra Jira-APIet.
					</Text>
					<Text>
						Dette kan tyde på at du har oppgitt korrekt e-postadresse men feil
						passord.
					</Text>
					<Text>
						Gå først til{" "}
						<Link
							url="https://jira.udir.no/login.jsp"
							icon="externalLink"
							iconPlacement="right"
							openInNewTab
						>
							Jiras login-side
						</Link>{" "}
						og løs captchaen.
					</Text>
					<Text>
						Kontroller deretter passordet du har oppgitt i Jirasync før du
						prøver igjen.
					</Text>
				</>
			);
		case "JIRA_LOGIN":
			return (
				<>
					<H2>Feil brukernavn eller passord</H2>
					<Text>
						Jira-login-informasjonen du oppga var ikke korrekt. Sjekk brukernavn
						og passord og prøv igjen.
					</Text>
				</>
			);
		case "NETLIFY_MISSING_AUTH":
			return (
				<>
					<H2>Tomt brukernavn eller passord</H2>
					<Text>
						Kallet til Jira-proxien manglet brukernavn og/eller passord.
						Kontroller at du har oppgitt verdier for disse og prøv igjen.
					</Text>
				</>
			);
		case "NETLIFY_MISSING_DATES":
			return (
				<>
					<H2>Det har oppstått en feil</H2>
					<Text>
						Jira-proxien manglet enten fra- eller til-dato. Ta gjerne kontakt og
						fortell hvordan denne feilen kan reproduseres slik at den kan
						fikses.
					</Text>
				</>
			);
		case "UNKNOWN_NETLIFY_ERROR":
			return (
				<>
					<H2>Det har oppstått en feil</H2>
					<Text>
						Det oppstod en ukjent feil. Ta kontakt og oppgi event-id{" "}
						{error.payload} for å bidra til trouble-shooting.
					</Text>
				</>
			);
		case "UNKNOWN":
			return (
				<>
					<H2>Det har oppstått en feil</H2>
					<Text>
						Det oppstod en ukjent feil. Feilen har ikke blitt logget. Sjekk
						nettleser-konsoll og nettverksfanen for info, og ta gjerne kontakt
						om feilen.
					</Text>
				</>
			);
	}
};
