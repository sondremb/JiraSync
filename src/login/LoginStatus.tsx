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
import { useLogout } from "./useLogout";

export const LoginStatus: React.FC = () => {
	const { instance } = useMsal();
	const logout = useLogout();
	const navn = instance.getActiveAccount()?.name;
	return (
		<FlexRow halign="end">
			<FixedFlexColumn>
				<Text textStyle="label">
					<em>{navn}</em>
				</Text>
				<Link onClick={logout}>Logg ut</Link>
			</FixedFlexColumn>
			<Pictogram type="user" className="ml-8" />
		</FlexRow>
	);
};

const FixedFlexColumn = styled(FlexColumn)`
	align-items: flex-end;
`;
