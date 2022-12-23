import React, { useEffect, useState } from "react";

import { WeekAndYear } from "./Utils/dateUtils";
import { JiraLogin } from "./components/JiraLogin";
import { TimeTable } from "./components/TimeTable/TimeTable";
import { DevAuthModal } from "./components/DevAuthModal";
import {
	Button,
	colors,
	FlexColumn,
	FlexRow,
	H1,
	Icon,
	PageLayout,
	spacing,
	Text,
} from "@udir/lisa";
import { useCombinedState } from "./state";
import styled from "styled-components";
import { Example } from "./components/TimeTable/timetable-cell";
import { useCallableStatelessRequest } from "./client-utils";
import { BekkClient } from "./bekk-client";
import { isDevelopment } from "./Utils/envUtils";
import { useLockDate } from "./data/useLockDate";
import { useBekkTimecodes } from "./data/useBekkTimecodes";
import { isUdir } from "./timecode-map";
import { getJiraCredentials } from "./jiraCredentials";
import { useWeek } from "./data/useWeek";

const CenteredText = styled(Text)`
	text-align: center;
`;

const ColoredRow = styled(FlexRow)`
	background-color: ${colors.utvidetPrimærpalett.skifer35.hex};
	padding: ${spacing(8)};
`;

export const App: React.FC = () => {
	const { bekkTimecodes } = useBekkTimecodes();
	const [weekAndYear, setWeekAndYear] = useState<WeekAndYear>(
		WeekAndYear.now()
	);

	const { lockDate } = useLockDate();
	const { state: entries, timestamp } = useWeek(weekAndYear);

	const jiraCredentials = getJiraCredentials();
	const hasCredentials = jiraCredentials !== null;

	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	useEffect(() => {
		// skulle gjerne bare satt isLoginModalOpen som useState(!hasCredentials) i starten, men Lisa takler ikke at modaler er åpne ved første render
		if (!hasCredentials) setIsLoginModalOpen(true);
	}, []);

	const onNextWeekClick = () => {
		setWeekAndYear((old) => old.next());
	};

	const onPreviousWeekClick = () => {
		setWeekAndYear((old) => old.previous());
	};

	const putRequest = useCallableStatelessRequest({
		requestFunction: BekkClient.updateTimesheet,
	});

	const synchronize = () => {
		if (bekkTimecodes === undefined || entries === undefined) return;
		const udirEntries = entries.filter((entry) =>
			isUdir(bekkTimecodes[entry.id])
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
		/* Promise.all(promises).then(() =>
			stateManager.fetchAllData({ fromDate, toDate })
		); */
	};

	return (
		<PageLayout>
			<FlexRow valign="center" halign="space-between" className="mb-20">
				<FlexRow>
					<H1 className="mb-0 mr-40">Jirasync</H1>
					<Example />
				</FlexRow>
				<Button variant="outlined" onClick={synchronize}>
					Synkroniser
				</Button>
			</FlexRow>
			<ColoredRow halign="space-between" valign="center">
				<FlexRow>
					<Button
						variant="text"
						onClick={() => setIsLoginModalOpen(true)}
						icon="userFilled"
						colorTheme="dark"
					>
						Logg inn i Jira
					</Button>
					{isDevelopment() && <DevAuthModal />}
				</FlexRow>
				<FlexRow>
					<Button
						variant="text"
						onClick={onPreviousWeekClick}
						icon={<Icon type="arrow" direction="left" />}
						colorTheme="dark"
					>
						Forrige
					</Button>
					<FlexColumn halign="center" className="mx-40" width={`${55 / 16}rem`}>
						<CenteredText
							textStyle="Brødtekst uthevet"
							textColor={colors.støttefarge.grå98}
						>
							UKE {weekAndYear.week}
						</CenteredText>
						<CenteredText
							textStyle="Brødtekst uthevet"
							textColor={colors.støttefarge.grå98}
						>
							{weekAndYear.year}
						</CenteredText>
					</FlexColumn>
					<Button
						variant="text"
						onClick={onNextWeekClick}
						icon={<Icon type="arrow" direction="right" />}
						iconPlacement="right"
						colorTheme="dark"
					>
						Neste
					</Button>
				</FlexRow>
				<Button
					variant="text"
					icon="refresh"
					onClick={() => null}
					colorTheme="dark"
				>
					Oppdater
				</Button>
			</ColoredRow>
			{entries !== undefined && lockDate !== undefined && (
				<TimeTable
					entries={entries}
					days={weekAndYear.days()}
					lockDate={lockDate}
				/>
			)}
			<Text>Sist lastet ned: {timestamp?.toISOString()}</Text>
			<JiraLogin
				isOpen={isLoginModalOpen}
				close={() => setIsLoginModalOpen(false)}
			/>
		</PageLayout>
	);
};
