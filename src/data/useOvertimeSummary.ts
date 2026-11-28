import { useQuery } from "@tanstack/react-query";
import type { YearMonth } from "../overtime/overtime";
import { loadOvertimeSummary } from "./loadOvertimeSummary";

/** The month's overtime to sign, fetched while `month` is set. */
export const useOvertimeSummary = (month: YearMonth | null) =>
	useQuery({
		queryKey: ["bekk", "overtime", month?.year, month?.month],
		queryFn: () => loadOvertimeSummary(month!),
		enabled: month !== null,
		// Locking changes the summary, so always fetch it fresh.
		staleTime: 0,
		gcTime: 0,
	});
