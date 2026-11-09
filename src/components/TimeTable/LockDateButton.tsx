import React from "react";
import { Button } from "@digdir/designsystemet-react";
import { PadlockLockedIcon, PadlockUnlockedIcon } from "@navikt/aksel-icons";
import { useLockDate } from "../../data/useLockDate";
import { IsoDate } from "../../date-time/IsoWeek";

interface Props {
	day: IsoDate;
	onClick: () => void;
}

export const LockDateButton: React.FC<Props> = ({ day, onClick }) => {
	const { lockDate } = useLockDate();
	const locked = lockDate === undefined || day <= lockDate;
	const label =
		lockDate === undefined
			? "Låsedato er ukjent"
			: locked
				? `${IsoDate.formatLong(day)} er låst`
				: `Lås timer til og med ${IsoDate.formatLong(day)}`;

	return (
		<Button
			variant="tertiary"
			icon
			disabled={locked}
			aria-label={label}
			title={label}
			onClick={onClick}
		>
			{locked ? (
				<PadlockLockedIcon aria-hidden />
			) : (
				<PadlockUnlockedIcon aria-hidden />
			)}
		</Button>
	);
};
