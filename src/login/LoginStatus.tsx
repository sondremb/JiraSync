import { FlexColumn, FlexRow, Link, Pictogram, Text } from "@udir/lisa";
import React from "react";
import styled from "styled-components";
import { clearJiraCredentials } from "../jiraCredentials";
import { clearBekkToken } from "./bekk/token";
import { getBekkLoginStatus } from "./bekk/useBekkUser";

export const LoginStatus: React.FC = () => {
	const { user } = getBekkLoginStatus();
	if (user === null) {
		return null;
	}
	const onClick = () => {
		clearJiraCredentials();
		clearBekkToken();
		window.location.reload();
	};
	return (
		<FlexRow halign="end">
			<FixedFlexColumn>
				<Text textStyle="label">
					<em>{user.name}</em>
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
