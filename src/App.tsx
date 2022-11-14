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
import {
	colors,
	ColorType,
	FlexColumn,
	FlexRow,
	H1,
	Icon,
	PageLayout,
	SecondaryButton,
	spacing,
	Text,
} from "@udir/lisa";
import { useCombinedState } from "./state";
import { useStore } from "./store/store";
import styled from "styled-components";
import { TextButton } from "./components/TextButton";
import { Example } from "./components/TimeTable/timetable-cell";
import { useCallableStatelessRequest } from "./client-utils";
import { BekkClient } from "./bekk-client";
import { isDevelopment } from "./Utils/envUtils";

const CenteredText = styled(Text)`
	text-align: center;
`;

const ColoredRow = styled(FlexRow)`
	background-color: ${colors.utvidetPrimærpalett.skifer35.hex};
	padding: ${spacing(8)};
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
		// skulle gjerne bare satt isLoginModalOpen som useState(!hasCredentials) i starten, men Lisa takler ikke at modaler er åpne ved første render
		if (!hasCredentials) setIsLoginModalOpen(true);
	}, []);

	useEffect(() => {
		if (hasCredentials) stateManager.fetchJiraData({ fromDate, toDate });
	}, [state.jiraUsername, state.jiraPassword]);

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
	const putRequest = useCallableStatelessRequest({
		requestFunction: BekkClient.updateTimesheet,
	});

	const synchronize = () => {
		const udirEntries = stateManager.state.entries.filter(
			(entry) => state.bekkTimecodes[entry.id].isUdir
		);
		const udirDays = udirEntries.flatMap((entry) =>
			Object.entries(entry.days).map(([dateString, day]) => ({
				...day,
				dateString,
				id: entry.id,
			}))
		);
		const daysWithDifference = udirDays.filter(
			(day) => day.bekkHours !== day.totalJiraHours
		);
		const promises = daysWithDifference.map((day) =>
			putRequest.execute({
				timecodeId: day.id,
				hours: day.totalJiraHours,
				dateString: day.dateString,
			})
		);
		Promise.all(promises).then(() =>
			stateManager.fetchAllData({ fromDate, toDate })
		);
	};

	return (
		<PageLayout>
			<FlexRow valign="center" halign="space-between" className="mb-20">
				<FlexRow>
					<H1 style={{ marginBottom: "0" }} className="mr-40">
						Jirasync
					</H1>
					<Example />
				</FlexRow>
				<SecondaryButton onClick={synchronize}>Synkroniser</SecondaryButton>
			</FlexRow>
			<ColoredRow halign="space-between" valign="center">
				<FlexRow>
					<TextButton
						onClick={() => setIsLoginModalOpen(true)}
						icon="userFilled"
						colorTheme="dark"
					>
						Logg inn i Jira
					</TextButton>
					{isDevelopment() && <DevAuthModal />}
				</FlexRow>
				<FlexRow>
					<TextButton
						onClick={onPreviousWeekClick}
						icon={<Icon type="arrow" direction="left" />}
						colorTheme="dark"
					>
						Forrige
					</TextButton>
					<FlexColumn halign="center" className="mx-40" width={`${55 / 16}rem`}>
						<CenteredText
							textStyle="Brødtekst uthevet"
							getColor={(c: ColorType) => c.støttefarge.grå98}
						>
							UKE {fromDate.week()}
						</CenteredText>
						<CenteredText
							textStyle="Brødtekst uthevet"
							getColor={(c: ColorType) => c.støttefarge.grå98}
						>
							{fromDate.year()}
						</CenteredText>
					</FlexColumn>
					<TextButton
						onClick={onNextWeekClick}
						icon={<Icon type="arrow" direction="right" />}
						iconPlacement="right"
						colorTheme="dark"
					>
						Neste
					</TextButton>
				</FlexRow>
				<TextButton
					icon="refresh"
					onClick={onGetTimesheetsClick}
					colorTheme="dark"
				>
					Oppdater
				</TextButton>
			</ColoredRow>
			{!stateManager.pending && stateManager.state.lockDate !== undefined && (
				<TimeTable
					entries={stateManager.state.entries}
					days={dayRange(fromDate, toDate)}
					lockDate={stateManager.state.lockDate}
				/>
			)}
			<JiraLogin
				isOpen={isLoginModalOpen}
				close={() => setIsLoginModalOpen(false)}
			/>
		</PageLayout>
	);
};
