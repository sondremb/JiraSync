import React, { useEffect, useState } from "react";

import { TimeTable } from "./components/TimeTable/TimeTable";
import {
	Button,
	FlexColumn,
	FlexRow,
	H1,
	Icon,
	PageLayout,
	Text,
} from "@utdanningsdirektoratet/lisa";
import styled from "styled-components";
import { Example } from "./components/TimeTable/timetable-cell";
import { useLockDate } from "./data/useLockDate";
import { isUdir } from "./timecode-map";
import { useWeek } from "./data/useWeek";
import { AltStemmerAlert } from "./components/AltStemmerAlert";
import { DownloadTimestamp } from "./components/DownloadTimestamp";
import { colors, spacing } from "@utdanningsdirektoratet/lisa-tokens";
import { LoginStatus } from "./login/LoginStatus";
import { IsoWeek } from "./date-time/IsoWeek";
import { addDays } from "date-fns";

const CenteredText = styled(Text)`
	text-align: center;
`;

const ColoredRow = styled(FlexRow)`
	background-color: ${colors.skifer500};
	padding: ${spacing(8)};
`;
interface Props {
	initialWeek: IsoWeek;
}

export const App: React.FC<Props> = ({ initialWeek }) => {
	const { lockDate } = useLockDate();
	const [weekAndYear, setWeekAndYear] = useState<IsoWeek>(initialWeek);

	useEffect(() => {
		if (lockDate === undefined || weekAndYear !== undefined) return;

		const dayAfterLockDate = addDays(new Date(lockDate), 1);
		const isoWeek = IsoWeek.fromDate(dayAfterLockDate);
		setWeekAndYear(isoWeek);
	}, [lockDate]);

	const { state: entries, timestamp, updateBekkHours } = useWeek(weekAndYear);

	const onNextWeekClick = () => {
		setWeekAndYear((old) => IsoWeek.next(old));
	};

	const onPreviousWeekClick = () => {
		setWeekAndYear((old) => IsoWeek.previous(old));
	};

	const synchronize = () => {
		if (entries === undefined || lockDate === undefined) return;
		const udirEntries = entries.filter((entry) => isUdir(entry.id));
		const udirDays = udirEntries.flatMap((entry) =>
			Object.entries(entry.days).map(([dateString, day]) => ({
				...day,
				dateString,
				id: entry.id,
			}))
		);
		const daysWithDifference = udirDays
			.filter((day) => day.bekkHours !== day.totalJiraHours)
			.filter((day) => day.dateString > lockDate);
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
				<LoginStatus />
			</FlexRow>
			<FlexRow halign="space-between" className="mb-12">
				{timestamp && <DownloadTimestamp timestamp={timestamp} />}
			</FlexRow>
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
						UKE {IsoWeek.toParts(weekAndYear).week}
					</CenteredText>
					<CenteredText textStyle="bodyBold" textColor="grå100">
						{IsoWeek.toParts(weekAndYear).year}
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
					days={IsoWeek.days(weekAndYear)}
					lockDate={lockDate}
				/>
			)}
			<AltStemmerAlert entries={entries} onSynchronize={synchronize} />
		</PageLayout>
	);
};
