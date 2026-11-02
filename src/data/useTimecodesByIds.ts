import { useQuery } from "@tanstack/react-query";
import { loadTimecodesByIds } from "./loadTimecodes";

export function useTimecodesByIds(ids: readonly number[]) {
	const sortedIds = [...new Set(ids)].sort((a, b) => a - b);
	return useQuery({
		queryKey: ["bekk", "timecodes", "byIds", sortedIds],
		staleTime: Infinity,
		queryFn: () => loadTimecodesByIds(sortedIds),
		enabled: sortedIds.length > 0,
	});
}
