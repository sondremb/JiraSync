import React, { useEffect, useState } from "react";

import { WeekAndYear } from "./Utils/dateUtils";
import { JiraLogin } from "./components/JiraLogin";
import { TimeTable } from "./components/TimeTable/TimeTable";
import { DevAuthModal } from "./components/DevAuthModal";
import {
	Button,
	FlexColumn,
	FlexRow,
	H1,
	Icon,
	PageLayout,
	Text,
} from "@udir/lisa";
import styled from "styled-components";
import { Example } from "./components/TimeTable/timetable-cell";
import { isDevelopment } from "./Utils/envUtils";
import { useLockDate } from "./data/useLockDate";
import { useBekkTimecodes } from "./data/useBekkTimecodes";
import { isUdir } from "./timecode-map";
import { getJiraCredentials } from "./jiraCredentials";
import { useWeek } from "./data/useWeek";
import { AltStemmerAlert } from "./components/AltStemmerAlert";
import { DownloadTimestamp } from "./components/DownloadTimestamp";
import { colors, spacing } from "@udir/lisa-tokens";

const CenteredText = styled(Text)`
	text-align: center;
`;

const ColoredRow = styled(FlexRow)`
	background-color: ${colors.skifer500};
	padding: ${spacing(8)};
`;

export const App: React.FC = () => {
	const { bekkTimecodes } = useBekkTimecodes();
	const [weekAndYear, setWeekAndYear] = useState<WeekAndYear>(
		WeekAndYear.now()
	);

	const { lockDate } = useLockDate();
	const { state: entries, timestamp, updateBekkHours } = useWeek(weekAndYear);

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
		daysWithDifference.forEach((day) =>
			updateBekkHours({
				timecodeId: day.id,
				hours: day.totalJiraHours,
				dateString: day.dateString,
			})
		);
	};

	return (
		<PageLayout>
			<FlexRow valign="center" halign="space-between" className="mb-20">
				<FlexRow>
					<H1 textStyle="display" className="mb-0 mr-40">
						Jirasync
					</H1>
					<Example />
				</FlexRow>
				<FlexRow>
					{isDevelopment() && <DevAuthModal />}
					<Button
						variant="text"
						onClick={() => setIsLoginModalOpen(true)}
						icon="userFilled"
					>
						Logg inn i Jira
					</Button>
				</FlexRow>
			</FlexRow>
			{timestamp && <DownloadTimestamp timestamp={timestamp} />}
			<ColoredRow halign="center" valign="center">
				<Button
					variant="text"
					onClick={onPreviousWeekClick}
					icon={<Icon type="arrow" direction="left" />}
					colorTheme="dark"
				>
					Forrige
				</Button>
				<FlexColumn halign="center" className="mx-40" width={`${55 / 16}rem`}>
					<CenteredText textStyle="bodyBold" textColor="grå100">
						UKE {weekAndYear.week}
					</CenteredText>
					<CenteredText textStyle="bodyBold" textColor="grå100">
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
			</ColoredRow>
			{entries !== undefined && lockDate !== undefined && (
				<TimeTable
					entries={entries}
					days={weekAndYear.days()}
					lockDate={lockDate}
				/>
			)}
			<AltStemmerAlert entries={entries} onSynchronize={synchronize} />
			<JiraLogin
				isOpen={isLoginModalOpen}
				close={() => setIsLoginModalOpen(false)}
			/>
		</PageLayout>
	);
};
