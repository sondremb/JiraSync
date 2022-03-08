import React, { useState } from "react";
import { Checkbox, ConfirmModal, InputField } from "@udir/lisa";
import { clearCredentials, storeCredentials } from "../Utils/localstorageUtils";

interface Props {
	username: string;
	setUsername: (userName: string) => void;
	password: string;
	setPassword: (password: string) => void;
	isOpen: boolean;
	close: () => void;
}

export const JiraLogin: React.FC<Props> = (props) => {
	const [save, setSave] = useState(!!props.username && !!props.password);
	const handleSubmit = () => {
		if (save) {
			storeCredentials(props.username, props.password);
		}
	};

	const handleRememberMeChange = (newValue: boolean) => {
		if (!newValue) {
			clearCredentials();
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
			id="jira-login-modal"
		>
			<InputField
				id="username"
				label="Brukernavn"
				value={props.username}
				handleChange={(e) => props.setUsername(e.target.value)}
			/>
			<InputField
				id="password"
				label="Passord"
				type="password"
				value={props.password}
				handleChange={(e) => props.setPassword(e.target.value)}
			/>
			<Checkbox
				label="Husk meg"
				onChange={handleRememberMeChange}
				checked={save}
				id="remember-me"
				className="mb-20"
			/>
		</ConfirmModal>
	);
};
