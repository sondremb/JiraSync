import { useQuery } from "@tanstack/react-query";
import { loadAllTimecodes } from "./loadTimecodes";

/** The full timecode list is large; only fetch it where a picker needs it. */
export function useAllTimecodes() {
	return useQuery({
		queryKey: ["bekk", "timecodes", "all"],
		staleTime: Infinity,
		queryFn: loadAllTimecodes,
	});
}
