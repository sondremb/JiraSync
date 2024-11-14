import { V3 } from "../bekk-api/V3";
import { useClient } from "../Utils/bekkClientUtils";
import useSwrImmutable from "swr/immutable";
import { TimecodeViewModelV3DTO } from "../bekk-api/data-contracts";

export const useBekkTimecode = (
	timecodeId: number
): TimecodeViewModelV3DTO | undefined => {
	const client = useClient(V3);

	const { data } = useSwrImmutable(`bekktimecodes/${timecodeId}`, () =>
		client.timecodesList({ Ids: [timecodeId] })
	);

	if (data?.data !== undefined && data?.data.length !== 1) {
		console.error(`Expected exactly one timecode with id ${timecodeId}`);
		return;
	}
	return data?.data[0];
};
