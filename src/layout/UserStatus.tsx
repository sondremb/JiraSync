import { useMsal } from "@azure/msal-react";
import { Link, Paragraph } from "@digdir/designsystemet-react";
import React from "react";
import { useLogout } from "../login/useLogout";
import { Column } from "./Column";

export const UserStatus: React.FC = () => {
	const { instance } = useMsal();
	const logout = useLogout();
	const name = instance.getActiveAccount()?.name;
	return (
		<Column gap="small" style={{ alignItems: "flex-end" }}>
			<Paragraph data-size="sm">
				<em>{name}</em>
			</Paragraph>
			<Link
				href="/logout"
				data-size="sm"
				onClick={(event) => {
					event.preventDefault();
					void logout();
				}}
			>
				Logg ut
			</Link>
		</Column>
	);
};
