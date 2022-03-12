import React, { useState } from "react";
import { ConfirmModal, TextArea } from "@udir/lisa";
import { storeUserToken } from "../Utils/localstorageUtils";
import styled from "styled-components";
import { TextButton } from "./TextButton";

const StyledDiv = styled.div`
	textarea {
		font-family: "Operator Mono", "Fira Code Retina", "Fira Code",
			FiraCode-Retina, "Andale Mono", "Lucida Console", Consolas, Monaco,
			monospace;
	}
`;

export const DevAuthModal: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [token, setToken] = useState("");
	return (
		<div>
			<TextButton
				onClick={() => {
					setOpen(true);
				}}
				colorTheme="dark"
				icon="user"
			>
				Sett userToken
			</TextButton>
			<ConfirmModal
				title={"Lagre userToken"}
				confirmLabel={"Lagre"}
				cancelLabel={"Avbryt"}
				onConfirm={() => {
					storeUserToken(token);
					setOpen(false);
				}}
				showModal={open}
				onCancel={() => {
					setToken("");
					setOpen(false);
				}}
				id="usertoken-modal"
				bottomPadding
			>
				<StyledDiv className="mb-20">
					<TextArea
						label="userToken"
						description="Hent fra local storage i TimeKeeper"
						value={token}
						handleChange={(e) => setToken(e.target.value)}
						placeholder="userToken går her..."
					/>
				</StyledDiv>
			</ConfirmModal>
		</div>
	);
};
