import useSWRImmutable from "swr/immutable";
import { TimecodeEssentialsDTO } from "../bekk-api/data-contracts";
import { Timecodeaccesses } from "../bekk-api/Timecodeaccesses";
import { useEmployeeId } from "../login/bekk/example2";
import { useClient } from "../Utils/bekkClientUtils";

type BekkTimecodeRecord = Record<
	NonNullable<TimecodeEssentialsDTO["id"]>,
	TimecodeEssentialsDTO
>;

export const useBekkTimecodes = () => {
	const client = useClient(Timecodeaccesses);
	const employeeId = useEmployeeId();
	const { data } = useSWRImmutable("bekk-timecodes", () =>
		client.employeeDetail(employeeId)
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
