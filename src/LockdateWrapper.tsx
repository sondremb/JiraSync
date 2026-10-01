import React from "react";
import { addDays } from "date-fns";
import { App } from "./App";
import { useLockDate } from "./data/useLockDate";
import { IsoWeek } from "./date-time/IsoWeek";
import { RulesetWrapper } from "./RulesetWrapper";

export const LockdateWrapper: React.FC = () => {
	const { lockDate, error } = useLockDate();
	const initialWeek = lockDate
		? IsoWeek.fromDate(addDays(new Date(lockDate), 1))
		: IsoWeek.fromDate(new Date());

	return (
		<RulesetWrapper>
			{error && <p role="alert">Kunne ikke hente låsedato: {error.message}</p>}
			<App initialWeek={initialWeek} />
		</RulesetWrapper>
	);
};
