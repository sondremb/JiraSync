import { useQuery } from "@tanstack/react-query";
import { components } from "../generated/bekk-timekeeper";
import { bekkClient } from "./bekkclient";
import { getEmployeeId } from "../login/bekk/bekkLogin";

type BekkTimecode = components["schemas"]["TimecodeEssentials"];
type BekkTimecodeRecord = Record<number, BekkTimecode>;

export const useBekkTimecodes = () => {
	const { data } = useQuery({
		queryKey: ["bekk", "timecodes"],
		staleTime: Infinity,
		queryFn: async () => {
			const { data, response } = await bekkClient.GET(
				"/timecodeaccesses/employee/{employeeId}",
				{ params: { path: { employeeId: getEmployeeId() } } },
			);
			if (!response.ok) throw new Error("Failed to fetch timecodes");
			return data;
		},
	});

	const record: BekkTimecodeRecord | undefined = data?.reduce(
		(prev, curr) => (curr.id ? { ...prev, [curr.id]: curr } : prev),
		{} as BekkTimecodeRecord,
	);
	return { bekkTimecodes: record };
};
