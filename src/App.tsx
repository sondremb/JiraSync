import React, { useEffect, useState } from "react";
import "../style.scss";

import { Moment } from "moment";
import {
	dayRange,
	getNextWeek,
	getPreviousWeek,
	getStartAndEndOfWeek,
} from "./Utils/dateUtils";
import { JiraLogin } from "./components/JiraLogin";
import { TimeTable } from "./components/TimeTable/TimeTable";
import { DevAuthModal } from "./components/DevAuthModal";
import { FlexColumn, FlexRow, H1, Icon, PageLayout, Text } from "@udir/lisa";
import { useCombinedState } from "./state";
import { useStore } from "./store/store";
import styled from "styled-components";
import { TextButton } from "./components/TextButton";

const CenteredText = styled(Text)`
	text-align: center;
`;

export const App: React.FC = () => {
	const { state } = useStore();
	const [startOfWeek, endOfWeek] = getStartAndEndOfWeek();

	const [fromDate, setFromDate] = useState(startOfWeek);
	const [toDate, setToDate] = useState(endOfWeek);

	const hasCredentials = !!state.jiraUsername && !!state.jiraPassword;

	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	const stateManager = useCombinedState();

	useEffect(() => {
		stateManager.fetchBekkData({ fromDate, toDate });
		if (hasCredentials) {
			stateManager.fetchJiraData({ fromDate, toDate });
		}
	}, []);

	useEffect(() => {
		if (hasCredentials) stateManager.fetchJiraData({ fromDate, toDate });
	}, [hasCredentials]);

	const setDates = (from: Moment, to: Moment) => {
		setFromDate(from);
		setToDate(to);
		stateManager.fetchAllData({ fromDate: from, toDate: to });
	};

	const onNextWeekClick = () => {
		const [from, to] = getNextWeek(fromDate);
		setDates(from, to);
	};

	const onPreviousWeekClick = () => {
		const [from, to] = getPreviousWeek(fromDate);
		setDates(from, to);
	};

	async function onGetTimesheetsClick() {
		stateManager.fetchAllData({ fromDate, toDate });
	}

	return (
		<PageLayout>
			<H1>Jirasync</H1>
			<JiraLogin
				isOpen={isLoginModalOpen}
				close={() => setIsLoginModalOpen(false)}
			/>
			<DevAuthModal />
			<FlexRow halign="space-between" valign="end">
				<TextButton onClick={() => setIsLoginModalOpen(true)} icon="userFilled">
					Logg inn i Jira
				</TextButton>
				<FlexRow>
					<TextButton
						onClick={onPreviousWeekClick}
						icon={<Icon type="arrow" direction="left" />}
					>
						Forrige
					</TextButton>
					<FlexColumn halign="center" className="mx-40">
						<CenteredText textStyle="Brødtekst uthevet">
							UKE {fromDate.week()}
						</CenteredText>
						<CenteredText textStyle="Brødtekst uthevet">
							{fromDate.year()}
						</CenteredText>
					</FlexColumn>
					<TextButton
						onClick={onNextWeekClick}
						icon={<Icon type="arrow" direction="right" />}
						iconPlacement="right"
					>
						Neste
					</TextButton>
				</FlexRow>
				<TextButton icon="refresh" onClick={onGetTimesheetsClick}>
					Oppdater
				</TextButton>
			</FlexRow>
			{!stateManager.pending && (
				<TimeTable
					entries={stateManager.state.entries}
					days={dayRange(fromDate, toDate)}
				/>
			)}
		</PageLayout>
	);
};
