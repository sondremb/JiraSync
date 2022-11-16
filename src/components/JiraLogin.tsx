import React, { useState } from "react";
import { Checkbox, ConfirmModal, Container, InputField } from "@udir/lisa";
import { clearCredentials, storeCredentials } from "../Utils/localstorageUtils";
import { useStore } from "../store/store";
import { setPasswordAction, setUsernameAction } from "../store/actions";

interface Props {
	isOpen: boolean;
	close: () => void;
}

export const JiraLogin: React.FC<Props> = (props) => {
	const { state, dispatch } = useStore();
	const [username, setUsername] = useState(state.jiraUsername);
	const [password, setPassword] = useState(state.jiraPassword);
	const [save, setSave] = useState(!!username && !!password);

	const handleSubmit = () => {
		dispatch(setUsernameAction(username));
		dispatch(setPasswordAction(password));
		if (save) {
			storeCredentials(username, password);
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
