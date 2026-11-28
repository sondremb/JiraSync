import { useState } from "react";
import type { IsoDate, IsoMonth, IsoWeek } from "../date-time/IsoWeek";
import { useLockDate } from "../data/useLockDate";
import { planLock, type SignedOvertime } from "../overtime/overtime";
import { lockNotices, type LockAttempt } from "./lockMessages";

/** A lock that waits for the employee to sign the month's overtime. */
interface OvertimeSigning {
	lockDate: IsoDate;
	month: IsoMonth;
}

/**
 * Locking through a day of `week`: straight away, through the overtime dialog
 * when the lock closes a month, or refused when it closes several. Owns the
 * lock date, so the week and the lock read the same one.
 */
export const useLockFlow = (week: IsoWeek) => {
	const { lockDate, updateLockDate } = useLockDate();
	const [signing, setSigning] = useState<OvertimeSigning | null>(null);
	const [attempt, setAttempt] = useState<LockAttempt | null>(null);

	const lock = (day: IsoDate) => {
		if (updateLockDate.isPending) return;
		const plan = planLock(lockDate, day);
		if (plan.kind === "unknown-lock-date") return;
		updateLockDate.reset();
		setAttempt({
			week,
			refusedUntil:
				plan.kind === "one-month-at-a-time" ? plan.firstMonthEnd : null,
		});
		switch (plan.kind) {
			case "lock":
				updateLockDate.mutate({ lockDate: day });
				return;
			case "sign-overtime":
				setSigning({ lockDate: day, month: plan.month });
				return;
			case "one-month-at-a-time":
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
		lockDate,
		lock,
		/** The month whose overtime the dialog signs, while it's open. */
		signingMonth: signing?.month ?? null,
		confirmSigning,
		closeSigning,
		locking: updateLockDate.isPending,
		...lockNotices({
			week,
			attempt,
			signingOpen: signing !== null,
			error: updateLockDate.error,
			succeeded: updateLockDate.isSuccess,
		}),
	};
};
