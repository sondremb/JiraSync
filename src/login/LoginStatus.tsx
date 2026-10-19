import { useMsal } from "@azure/msal-react";
import {
	FlexColumn,
	FlexRow,
	Link,
	Pictogram,
	Text,
} from "@utdanningsdirektoratet/lisa";
import React from "react";
import styled from "styled-components";
import { jiraAuthenticationContext } from "./jira/authContext";

export const LoginStatus: React.FC = () => {
	const { instance } = useMsal();
	const onClick = async () => {
		// Must finish before the MSAL redirect, which would otherwise cancel the request
		// and leave the Jira refresh token cookie in place
		await jiraAuthenticationContext.logout();
		// Land on /logout (outside BekkEntraLogin) rather than "/", which would log straight back in
		await instance.logoutRedirect({
			postLogoutRedirectUri: `${window.location.origin}/logout`,
		});
	};
	const navn = instance.getActiveAccount()?.name;
	return (
		<FlexRow halign="end">
			<FixedFlexColumn>
				<Text textStyle="label">
					<em>{navn}</em>
				</Text>
				<Link onClick={onClick}>Logg ut</Link>
			</FixedFlexColumn>
			<Pictogram type="user" className="ml-8" />
		</FlexRow>
	);
};

const FixedFlexColumn = styled(FlexColumn)`
	align-items: flex-end;
`;
