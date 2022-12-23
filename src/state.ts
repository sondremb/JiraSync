import { Moment } from "moment";
import { useEffect, useState } from "react";
import { BekkClient } from "./bekk-client";
import { useCallableStatefulRequest } from "./client-utils";
import { NetlifyClient } from "./netlify-client";
import { BekkTimecodeEntry } from "./types.d";
import { updateEntries } from "./Utils/stateUtils";

interface FetchAllDataParams {
	fromDate: Moment;
	toDate: Moment;
}

export const useCombinedState = () => {
	const [entries, setEntries] = useState<BekkTimecodeEntry[]>([]);

	const jiraRequest = useCallableStatefulRequest({
		requestFunction: (params: FetchAllDataParams) =>
			NetlifyClient.getData({
				fromDate: params.fromDate,
				toDate: params.toDate,
			}),
	});

	const bekkRequest = useCallableStatefulRequest({
		requestFunction: BekkClient.getData,
	});

	const fetchAllData = (params: FetchAllDataParams) => {
		jiraRequest.execute(params);
		bekkRequest.execute(params);
	};

	useEffect(() => {
		const jiraData = jiraRequest.data;
		if (jiraData !== undefined) {
			if (!bekkRequest.loading && bekkRequest.data !== undefined) {
				setEntries(updateEntries(bekkRequest.data, jiraData));
			}
		}
	}, [jiraRequest.data]);

	useEffect(() => {
		const bekkData = bekkRequest.data;
		if (bekkData !== undefined) {
			if (!jiraRequest.loading && jiraRequest.data !== undefined) {
				setEntries(updateEntries(bekkData, jiraRequest.data));
			}
		}
	}, [bekkRequest.data]);

	return {
		state: {
			entries,
		},
		fetchBekkData: bekkRequest.execute,
		fetchJiraData: jiraRequest.execute,
		fetchAllData,
		pending: bekkRequest.loading || jiraRequest.loading,
	};
};
