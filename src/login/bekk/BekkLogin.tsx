import React from "react";
import { authenticate, checkAuthentication } from "./token";
import { getBekkLoginStatus } from "./useBekkUser";

interface Props {
	children?: React.ReactNode;
}

export const BekkLogin: React.FC<Props> = ({ children }) => {
	checkAuthentication();
	const loginState = getBekkLoginStatus();

	if (loginState.status !== "valid") {
		authenticate();
	}
	return <>{children}</>;
};
