import { useQuery } from "@tanstack/react-query";
import { components } from "../generated/bekk-timekeeper";
import { bekkClient } from "./bekkclient";

type TimecodeViewModelV3 = components["schemas"]["TimecodeViewModelV3"];

export const useBekkTimecode = (
	timecodeId: number,
): TimecodeViewModelV3 | undefined => {
	const { data } = useQuery({
		queryKey: ["bekk", "timecode", timecodeId],
		staleTime: Infinity,
		queryFn: async () => {
			const { data, response } = await bekkClient.GET("/v3/timecodes", {
				params: { query: { Ids: [timecodeId] } },
			});
			if (!response.ok)
				throw new Error(`Failed to fetch timecode ${timecodeId}`);
			if (data !== undefined && data.length !== 1) {
				console.error(`Expected exactly one timecode with id ${timecodeId}`);
				return undefined;
			}
			return data?.[0];
		},
	});

	return data;
};
