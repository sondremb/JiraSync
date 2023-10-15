import { FlexRow, Loading } from "@udir/lisa";
import { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { StatusCode } from "../../jira-client";
import {
	getJiraCredentials,
	JiraCredentials,
	setJiraCredentials,
} from "../../jiraCredentials";
import { NetlifyClient } from "../../netlify-client";
import { LoginForm } from "./LoginForm";

interface Props {
	children?: React.ReactNode;
}

export const JiraLogin: React.FC<Props> = ({ children }) => {
	const credentials = getJiraCredentials();
	const [isFirstLoad, setIsFirstLoad] = useState(credentials !== null);
	const [loginResult, setLoginResult] = useState<AxiosResponse | undefined>();
	const [loginPending, setLoginPending] = useState(false);

	const onLogin = (credentials: JiraCredentials, rememberMe: boolean) => {
		setLoginPending(true);
		setLoginResult(undefined);
		NetlifyClient.authenticate(credentials)
			.then((result) => {
				setJiraCredentials(credentials, rememberMe);
				setLoginPending(false);
				setLoginResult(result);
			})
			.catch((error: AxiosError) => {
				if (error.response) {
					setLoginResult(error.response);
				}
				// TODO håndter uventede feil
			})
			.finally(() => {
				setLoginPending(false);
				setIsFirstLoad(false);
			});
	};
	useEffect(() => {
		if (credentials !== null) {
			onLogin(credentials, false);
		} else {
			setIsFirstLoad(false);
		}
	}, []);

	if (isFirstLoad) {
		return (
			<FlexRow height="80vh" halign="center" valign="center">
				<Loading pending size="extraLarge" />
			</FlexRow>
		);
	}

	if (!credentials || loginResult?.status !== StatusCode.OK_200) {
		return (
			<LoginForm
				initialCredentials={credentials}
				onLogin={onLogin}
				loginStatus={loginResult}
				loginPending={loginPending}
			/>
		);
	}

	return <>{children}</>;
};
