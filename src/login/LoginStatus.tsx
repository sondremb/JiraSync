import { useMsal } from "@azure/msal-react";
import { FlexColumn, FlexRow, Link, Pictogram, Text } from "@udir/lisa";
import React from "react";
import styled from "styled-components";

export const LoginStatus: React.FC = () => {
	const { instance } = useMsal();
	const onClick = () => {
		instance.logoutRedirect();
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
