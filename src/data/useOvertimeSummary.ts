import { useQuery } from "@tanstack/react-query";
import type { IsoMonth } from "../date-time/IsoWeek";
import { loadOvertimeSummary } from "./loadOvertimeSummary";

/** The month's overtime to sign. */
export const useOvertimeSummary = (month: IsoMonth) =>
	useQuery({
		queryKey: ["bekk", "overtime", month],
		queryFn: () => loadOvertimeSummary(month),
		// Locking changes the summary, so always fetch it fresh.
		staleTime: 0,
		gcTime: 0,
	});
