import React from "react";
import { App } from "./App";
import { useLockDate } from "./data/useLockDate";
import { IsoDate, IsoWeek } from "./date-time/IsoWeek";
import { RulesetWrapper } from "./RulesetWrapper";

export const LockdateWrapper: React.FC = () => {
	const { lockDate, error } = useLockDate();
	const initialWeek = lockDate
		? IsoWeek.fromIsoDate(IsoDate.addDays(lockDate, 1))
		: IsoWeek.fromDate(new Date());

	return (
		<RulesetWrapper>
			{error && <p role="alert">Kunne ikke hente låsedato: {error.message}</p>}
			<App initialWeek={initialWeek} />
		</RulesetWrapper>
	);
};
