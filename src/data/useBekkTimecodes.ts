import useSWRImmutable from "swr/immutable";
import { TimecodeEssentialsDTO } from "../bekk-api/data-contracts";
import { Timecodeaccesses } from "../bekk-api/Timecodeaccesses";
import { getEmployeeIdFromToken } from "../login/bekk/token";
import { createClient } from "../Utils/bekkClientUtils";

type BekkTimecodeRecord = Record<
	NonNullable<TimecodeEssentialsDTO["id"]>,
	TimecodeEssentialsDTO
>;

export const useBekkTimecodes = () => {
	const client = createClient(Timecodeaccesses);
	const { data } = useSWRImmutable("bekk-timecodes", () =>
		client.employeeDetail(getEmployeeIdFromToken())
	);
	// TODO error handling

	const record: BekkTimecodeRecord | undefined = data?.data.reduce(
		(prev, curr) => (curr.id ? { ...prev, [curr.id]: curr } : prev),
		{} as BekkTimecodeRecord
	);
	return {
		bekkTimecodes: record,
	};
};
