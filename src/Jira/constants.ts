import { TKId } from "../Timekeeper/constants";
import { Responses } from "../types_OLD";

export const delivery_field_name = "customfield_10702";

const jiraToTimecodeMap = [
	{
		selector: (jiraIssue: Responses.Worklog) => {
			const nyttGjennomforingssystemLabel = "EPS felles";
			const deliveryField = jiraIssue?.fields?.find((item) => item.value);
			return deliveryField?.label === nyttGjennomforingssystemLabel;
		},
		timecodeId: TKId.NyGjennomføring,
	},
	{
		selector: (jiraIssue: Responses.Worklog) => {
			return /PASX.*/.test(jiraIssue.key);
		},
		timecodeId: TKId.PASEksamen,
	},
	{
		selector: (jiraIssue: Responses.Worklog) => {
			return /PASP.*/.test(jiraIssue.key);
		},
		timecodeId: TKId.PASPrøver,
	},
	{
		selector: (jiraIssue: Responses.Worklog) => {
			return /IDPF.*/.test(jiraIssue.key);
		},
		timecodeId: TKId.Pålogging,
	},
	{
		selector: (jiraIssue: Responses.Worklog) => {
			return /SO.*/.test(jiraIssue.key);
		},
		timecodeId: TKId.Systemoversikt,
	},
];

export const jiraIssueToTimecodeId = (jiraIssue: Responses.Worklog) => {
	for (let index = 0; index < jiraToTimecodeMap.length; index++) {
		const item = jiraToTimecodeMap[index];
		if (item.selector(jiraIssue)) {
			return item.timecodeId;
		}
	}
	return null;
};

export const isJiraTimecode = (timecodeId: TKId): boolean => {
	const jiraTimecodeIds = jiraToTimecodeMap.map((item) => item.timecodeId);
	return jiraTimecodeIds.indexOf(timecodeId) !== -1;
};
