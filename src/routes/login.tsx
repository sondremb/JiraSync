import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import emptyStateImg from "../../assets/svg/emptystate.svg";
import {
	Button,
	FlexColumn,
	H1,
	PageLayout,
	useScreenSize,
} from "@utdanningsdirektoratet/lisa";
import { ScreenSize } from "@utdanningsdirektoratet/lisa-tokens";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const screenSize = useScreenSize();
	return (
		<PageLayout>
			<H1>Velkommen til JiraSync!</H1>
			<FlexColumn
				valign="center"
				height="80vh"
				maxWidth="700px"
				margin="0 auto"
				gap={80}
			>
				<img
					style={{
						flex: "0 0 347px",
						minWidth: "200px",
					}}
					className={
						screenSize > ScreenSize.small ? "ml-40 pl-40" : "ml-20 pl-20"
					}
					src={emptyStateImg}
					alt="empty state"
				/>
				<Button url=".netlify/functions/jira-auth-init">Logg inn</Button>
			</FlexColumn>
		</PageLayout>
	);
}
