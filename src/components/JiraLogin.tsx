import React, { useState } from "react";
import { Checkbox, ConfirmModal, Container, InputField } from "@udir/lisa";
import {
	clearJiraCredentials,
	getJiraCredentials,
	setJiraCredentials,
} from "../jiraCredentials";

interface Props {
	isOpen: boolean;
	close: () => void;
}

export const JiraLogin: React.FC<Props> = (props) => {
	const savedCredentials = getJiraCredentials();
	const [username, setUsername] = useState(savedCredentials?.username ?? "");
	const [password, setPassword] = useState(savedCredentials?.password ?? "");
	const [save, setSave] = useState(!!username && !!password);

	const handleSubmit = () => {
		setJiraCredentials({ username, password }, save);
	};

	const handleRememberMeChange = (newValue: boolean) => {
		if (!newValue) {
			clearJiraCredentials();
		}
		setSave(newValue);
	};

	return (
		<ConfirmModal
			title="Logg inn i Jira"
			confirmLabel="Logg in"
			cancelLabel="Avbryt"
			onConfirm={() => {
				handleSubmit();
				props.close();
			}}
			showModal={props.isOpen}
			onCancel={props.close}
			maxWidth="900px"
		>
			<Container width="400px" maxWidth="100%" minWidth="0">
				<InputField
					id="username"
					label="E-postadresse"
					value={username}
					handleChange={(e) => setUsername(e.target.value)}
					placeholder="ditt.navn@udir.no"
					className="my-20"
				/>
				<InputField
					id="password"
					label="Passord"
					type="password"
					value={password}
					handleChange={(e) => setPassword(e.target.value)}
					className="mb-12"
				/>
				<Checkbox
					label="Husk meg"
					onChange={handleRememberMeChange}
					checked={save}
					id="remember-me"
					className="mb-40"
				/>
			</Container>
		</ConfirmModal>
	);
};
