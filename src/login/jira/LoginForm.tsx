import { useMsal } from "@azure/msal-react";
import {
	Alert,
	Button,
	Checkbox,
	Container,
	Details,
	FlexRow,
	H1,
	H2,
	H3,
	InputField,
	PageLayout,
	Summary,
	Text,
	useScreenSize,
} from "@udir/lisa";
import { ScreenSize } from "@udir/lisa-tokens";
import { AxiosResponse } from "axios";
import React, { useState } from "react";
import { P } from "../../components/P";
import { StatusCode } from "../../jira-client";
import { JiraCredentials } from "../../jiraCredentials";

interface Props {
	initialCredentials?: JiraCredentials | null;
	onLogin: (credentials: JiraCredentials, rememberMe: boolean) => void;
	loginStatus: AxiosResponse | undefined;
	loginPending: boolean;
}

export const LoginForm: React.FC<Props> = ({
	initialCredentials,
	onLogin,
	loginStatus,
	loginPending,
}) => {
	const [username, setUsername] = useState<string>(
		initialCredentials?.username ?? ""
	);
	const [password, setPassword] = useState<string>(
		initialCredentials?.password ?? ""
	);
	const [rememberMe, setRememberMe] = useState<boolean>(
		initialCredentials !== null
	);

	const { instance } = useMsal();
	const name = instance.getActiveAccount()?.name;
	const errorMessage =
		loginStatus?.status === StatusCode.UNAUTHORIZED_401 ||
		loginStatus?.status === StatusCode.FORBIDDEN_403
			? "Feil brukernavn eller passord"
			: undefined;
	const screenSize = useScreenSize();
	return (
		<PageLayout>
			<H1 textStyle="display" className="mb-40">
				Jirasync
			</H1>
			<Container
				backgroundColor="stålblå300"
				borderRadius="medium"
				padding={screenSize > ScreenSize.xsmall ? 40 : { x: 4, y: 20 }}
				width="900px"
				maxWidth="100%"
				minWidth="0"
				margin={{ x: "auto" }}
			>
				<H2 textStyle="headline" className="mb-0">
					Velkommen, {name}!
				</H2>
				<H3 textStyle="title" className="mb-20">
					Autentiser mot Jira
				</H3>
				<FlexRow valign="start" halign="space-between">
					<form
						style={{
							width: "100%",
							maxWidth: "400px",
							minWidth: "0",
							flex: "1 1 400px",
						}}
					>
						<InputField
							id="username"
							label="E-postadresse"
							value={username}
							handleChange={(e) => setUsername(e.target.value)}
							placeholder="ditt.navn@udir.no"
							className="mt-12 mb-20"
							errorMessage={errorMessage}
						/>
						<InputField
							id="password"
							label="Passord"
							type="password"
							value={password}
							handleChange={(e) => setPassword(e.target.value)}
							className="mb-12"
							errorMessage={errorMessage}
						/>
						<Checkbox
							label="Husk meg"
							onChange={setRememberMe}
							checked={rememberMe}
							id="remember-me"
							className="mb-40"
						/>
					</form>

					{screenSize > ScreenSize.xsmall && (
						<img
							style={{
								flex: "1 2 347px",
								minWidth: "200px",
							}}
							className={
								screenSize > ScreenSize.small ? "ml-40 pl-40" : "ml-20 pl-20"
							}
							src="/assets/svg/emptyState.svg"
							alt="empty state"
						/>
					)}
				</FlexRow>
				<Alert
					type={"error"}
					showAlert={loginStatus?.status === StatusCode.FORBIDDEN_403}
					title="Midlertidig utestengt"
					closeable
					fullWidth
					className="mb-20"
				>
					<Text className="mb-12">
						Grunnet gjentatte mislykkede innloggingsforsøk er du midlertidig
						utestengt fra Jira-APIet. Dette betyr at e-posten du har forsøkt å
						logge inn med er riktig, men passordet er feil.
					</Text>
					<Text>Mer informasjon finnes lenger ned på siden</Text>
				</Alert>
				<Button
					onClick={() => onLogin({ username, password }, rememberMe)}
					pending={loginPending}
					className="mb-32"
				>
					Logg inn
				</Button>
				<Details open={false}>
					<Summary className="mb-12">Jeg har ikke brukt Jirasync før!</Summary>
					<P>Først og fremst, velkommen!</P>
					<P>
						Det første du må gjøre er å sette opp et passord i Jira. Som
						standard har ingen brukere passord, og kan kun logge inn med SSO.
						For å bruke APIene (som Jirasync gjør) må du ha et passord.
					</P>
					<P>
						Gå til Jira, logg ut, velg å logge inn igjen med brukernavn og
						passord. Da vil du finne en lenke merket{" "}
						<em>&quot;Can't access your account?&quot;</em> - bruk denne til å
						sette opp et ønskelig passord.
					</P>
				</Details>
				<Details open={false}>
					<Summary className="mb-12">Jeg er midlertidig utestengt</Summary>
					<P>
						Da må du gå til Jira, logge ut, og logge inn igjen med brukernavn og
						passord - <em>ikke</em> med SSO. Du burde få opp en CAPTCHA som du
						må løse før du kan logge inn.
					</P>
					<P>
						Hvis du ikke klarer å logge inn med passordet direkte i Jira heller,
						burde du gjøre en passord-reset ved å klikke på{" "}
						<em>&quot;Can't access your account?&quot;</em>
					</P>
				</Details>
			</Container>
		</PageLayout>
	);
};
