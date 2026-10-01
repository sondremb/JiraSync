import React, { useEffect, useRef, useState } from "react";

import { TimeTable } from "./components/TimeTable/TimeTable";
import {
	Button,
	FlexColumn,
	FlexRow,
	Icon,
	Text,
} from "@utdanningsdirektoratet/lisa";
import styled from "styled-components";
import { useLockDate } from "./data/useLockDate";
import { isUdir } from "./timecode-map";
import { useWeek } from "./data/useWeek";
import { AltStemmerAlert } from "./components/AltStemmerAlert";
import { DownloadTimestamp } from "./components/DownloadTimestamp";
import { colors, spacing } from "@utdanningsdirektoratet/lisa-tokens";
import { IsoDate, IsoWeek } from "./date-time/IsoWeek";
import { addDays } from "date-fns";
import { CopyTokenButton } from "./login/bekk/CopyTokenButton";
import { config } from "./Utils/envUtils";
import { RulesetModal } from "./components/RulesetModal";
import { useRuleSet } from "./data/useRuleset";
import { WeeklyReconciliation } from "./components/WeeklyReconciliation";

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
	const { selectedRuleset } = useRuleSet();
	const [weekAndYear, setWeekAndYear] = useState<IsoWeek>(initialWeek);
	const navigated = useRef(false);
	const initialLockDateApplied = useRef(false);

	useEffect(() => {
		if (lockDate === undefined || navigated.current || initialLockDateApplied.current) return;

		const dayAfterLockDate = addDays(new Date(lockDate), 1);
		const isoWeek = IsoWeek.fromDate(dayAfterLockDate);
		setWeekAndYear(isoWeek);
		initialLockDateApplied.current = true;
	}, [lockDate]);

	const onNextWeekClick = () => {
		navigated.current = true;
		setWeekAndYear((old) => IsoWeek.next(old));
	};

	const onPreviousWeekClick = () => {
		navigated.current = true;
		setWeekAndYear((old) => IsoWeek.previous(old));
	};

	return (
		<>
			<FlexRow halign="space-between" className="mb-12">
				<RulesetModal />
				{config.debug && <CopyTokenButton />}
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
			{lockDate !== undefined && <LegacyWeek week={weekAndYear} lockDate={lockDate} />}
			{selectedRuleset && <WeeklyReconciliation week={weekAndYear} ruleset={selectedRuleset} />}
		</>
	);
};

function LegacyWeek({ week, lockDate }: { week: IsoWeek; lockDate: IsoDate }) {
	const { state: entries, timestamp, updateBekkHours } = useWeek(week);
	const synchronize = () => {
		if (entries === undefined) return;
		const udirEntries = entries.filter((entry) => isUdir(entry.id));
		const udirDays = udirEntries.flatMap((entry) =>
			Object.entries(entry.days).map(([dateString, day]) => ({
				...day,
				dateString,
				id: entry.id,
			})),
		);
		const daysWithDifference = udirDays
			.filter((day) => day.bekkHours !== day.totalJiraHours)
			.filter((day) => day.dateString > lockDate);
		daysWithDifference.forEach((day) =>
			updateBekkHours({
				timecodeId: day.id,
				hours: day.totalJiraHours,
				date: IsoDate.parse(day.dateString),
			}),
		);
	};
	return (
		<>
			{timestamp && <DownloadTimestamp timestamp={timestamp} />}
			{entries !== undefined && (
				<TimeTable entries={entries} days={IsoWeek.days(week)} lockDate={lockDate} />
			)}
			<AltStemmerAlert entries={entries} onSynchronize={synchronize} />
		</>
	);
}
