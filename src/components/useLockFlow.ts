import { useState } from "react";
import type { IsoDate, IsoMonth } from "../date-time/IsoWeek";
import { useLockDate } from "../data/useLockDate";
import { planLock, type SignedOvertime } from "../overtime/overtime";

/** A lock that waits for the employee to sign the month's overtime. */
export interface OvertimeSigning {
	lockDate: IsoDate;
	month: IsoMonth;
}

/**
 * Locking through a day: straight away, through the overtime dialog when the
 * lock closes a month, or refused when it closes several.
 */
export const useLockFlow = () => {
	const { lockDate, updateLockDate } = useLockDate();
	const [signing, setSigning] = useState<OvertimeSigning | null>(null);
	/** The first month end, when a lock across several was refused. */
	const [refusedUntil, setRefusedUntil] = useState<IsoDate | null>(null);

	const lock = (day: IsoDate) => {
		if (updateLockDate.isPending) return;
		const plan = planLock(lockDate, day);
		setRefusedUntil(null);
		switch (plan.kind) {
			case "unknown-lock-date":
				return;
			case "lock":
				updateLockDate.mutate({ lockDate: day });
				return;
			case "sign-overtime":
				updateLockDate.reset();
				setSigning({ lockDate: day, month: plan.month });
				return;
			case "one-month-at-a-time":
				updateLockDate.reset();
				setRefusedUntil(plan.firstMonthEnd);
				return;
		}
	};

	const confirmSigning = (signedOvertime: SignedOvertime) => {
		if (!signing || updateLockDate.isPending) return;
		updateLockDate.mutate(
			{ lockDate: signing.lockDate, signedOvertime },
			{ onSuccess: () => setSigning(null) },
		);
	};

	const closeSigning = () => {
		if (updateLockDate.isPending) return;
		setSigning(null);
		// The dialog showed the error; don't repeat it below the grid.
		updateLockDate.reset();
	};

	return {
		lock,
		signing,
		confirmSigning,
		closeSigning,
		locking: updateLockDate.isPending,
		/** Shown in the dialog while it's open, below the grid otherwise. */
		lockError: updateLockDate.error,
		locked: updateLockDate.isSuccess,
		refusedUntil,
	};
};
