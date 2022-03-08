import React, { useEffect, useState } from "react";
import "../style.scss";

import ReactLoading from "react-loading";
import { Moment } from "moment";
import { loadPassword, loadUserName } from "./Utils/localstorageUtils";
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
	DefaultHeader,
	DefaultSubHeader,
	FlexRow,
	Icon,
	Menu,
	PageLayout,
	SecondaryButton,
} from "@udir/lisa";
import { Weekpicker } from "./components/Weekpicker";
import { TextButton } from "./components/TextButton";
import { useCombinedState } from "./state";

export const App: React.FC = () => {
	const [startOfWeek, endOfWeek] = getStartAndEndOfWeek();

	const [jiraUsername, setJiraUsername] = useState<string>(
		loadUserName() ?? ""
	);
	const [jiraPassword, setJiraPassword] = useState<string>(
		loadPassword() ?? ""
	);
	const [fromDate, setFromDate] = useState(startOfWeek);
	const [toDate, setToDate] = useState(endOfWeek);

	const hasCredentials = !!jiraUsername && !!jiraPassword;

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
		<>
			<Menu
				fornavn="Jira"
				etternavn="Sync"
				sections={[]}
				logoutUrl=""
				menuTitle="Jirasync"
				skipToContentHref=""
			/>
			<PageLayout
				header={
					<DefaultHeader
						title="Ukesync"
						titleExtraContent="Synkroniser uke for uke"
					/>
				}
				subheader={
					<DefaultSubHeader>
						<TextButton onClick={() => setIsLoginModalOpen(true)} icon="user">
							Logg inn i jira
						</TextButton>
					</DefaultSubHeader>
				}
			>
				<JiraLogin
					username={jiraUsername}
					setUsername={setJiraUsername}
					password={jiraPassword}
					setPassword={setJiraPassword}
					isOpen={isLoginModalOpen}
					close={() => setIsLoginModalOpen(false)}
				/>
				<DevAuthModal />
				<FlexRow halign="space-between" valign="end" className="center">
					<SecondaryButton
						onClick={onPreviousWeekClick}
						icon={<Icon type="arrow" direction="left" />}
					>
						Forrige
					</SecondaryButton>
					<Weekpicker
						start={fromDate}
						end={toDate}
						setStart={setFromDate}
						setEnd={setToDate}
						label="Uke"
					/>
					<SecondaryButton
						onClick={onNextWeekClick}
						icon={<Icon type="arrow" direction="right" />}
						iconPlacement="right"
					>
						Neste
					</SecondaryButton>
					<SecondaryButton icon="refresh" onClick={onGetTimesheetsClick}>
						Oppdater
					</SecondaryButton>
				</FlexRow>
				{!stateManager.pending && (
					<TimeTable
						data={stateManager.state}
						days={dayRange(fromDate, toDate)}
					/>
				)}

				{stateManager.pending && (
					<div className="spinner-wrapper">
						<ReactLoading
							type="spin"
							className="spinner"
							height="100px"
							width="100px"
						/>
					</div>
				)}
			</PageLayout>
		</>
	);
};
