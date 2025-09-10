import { JiraIssue } from "./data/issue";
import { BekkId } from "./types";

export const FrivilligKompetanseByggingId = 1786;

export enum UdirBekkIds {
	PASEksamen = 1000752,
	PASPrøver = 1000890,
	Pålogging = 1000854,
	Systemoversikt = 1002326,
	UBAS = 1002497,
	BistandTilHelhetligDesign = 1002899,
	HFLDataPlattform = 1002302,
	HFL = 1003011,
	HSS = 1003012,
	HFLSkjema = 1003290,
	UTA1113Design = 1003088,
	UTA1121KILab = 1003373,
	UTA1122HFLSommer = 1003386,
	UTA1124HFLEkstretildeling = 1003471,
}

interface TimecodeSelector {
	selector: (jiraIssue: JiraIssue) => boolean;
	timecodeId: BekkId;
}

const jiraToTimecodeMap: TimecodeSelector[] = [
	{
		selector: (jiraIssue) => {
			return /PASX.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.PASEksamen,
	},
	{
		selector: (jiraIssue) => {
			return /PASP.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.PASPrøver,
	},
	{
		selector: (jiraIssue) => {
			return /IDPF.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.Pålogging,
	},
	{
		selector: (jiraIssue) => {
			return /SO.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.Systemoversikt,
	},
	{
		selector: (jiraIssue) => {
			return /UBAS.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UBAS,
	},
	{
		selector: (jiraIssue) => {
			return /DESIGN.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.BistandTilHelhetligDesign,
	},
	{
		selector: (jiraIssue) => {
			return /KIL.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1121KILab,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			const epicLink = jiraIssue.epicLink;
			if (epicLink === null) {
				return false;
			}
			return (
				// Tilda
				/HFL-3068/.test(epicLink) ||
				// Dataplattform
				/HFL-3435/.test(epicLink)
			);
		},
		timecodeId: UdirBekkIds.HFLDataPlattform,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			const epicLink = jiraIssue.epicLink;
			if (epicLink === null) {
				return false;
			}
			return /HFL-7008/.test(epicLink);
		},
		timecodeId: UdirBekkIds.UTA1122HFLSommer,
	},
	{
		selector: (jiraIssue) => {
			const epicLink = jiraIssue.epicLink;
			if (epicLink === null) {
				return false;
			}
			if (/HSS-1030/.test(epicLink)) return true;
			return false;
		},
		timecodeId: UdirBekkIds.HFLSkjema,
	},
	{
		selector: (jiraIssue) => {
			const epicLink = jiraIssue.epicLink;
			if (epicLink === null) {
				return false;
			}
			return (
				// Aktørkjenneren
				/HFL-7152/.test(epicLink) ||
				// Ekstretildeling
				/HFL-6955/.test(epicLink)
			);
		},
		timecodeId: UdirBekkIds.UTA1124HFLEkstretildeling,
	},
	{
		selector: (jiraIssue) => {
			return /HFL.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.HFL,
	},
	{
		selector: (jiraIssue) => {
			return /HSS.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.HSS,
	},
	{
		selector: (jiraIssue) => {
			return /DESIGN.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1113Design,
	},
];

export const bekkIdFromJiraTimecode = (jiraIssue: JiraIssue) => {
	for (const { selector, timecodeId } of jiraToTimecodeMap) {
		if (selector(jiraIssue)) return timecodeId;
	}
	// TODO error-store
	console.error("Fant ingen Bekk-timekode tilsvarende:", jiraIssue);
	return -1;
};

export const isUdir = (timecodeId: number | undefined): boolean =>
	timecodeId !== undefined && timecodeId in UdirBekkIds;

/* function getField(
	jiraIssue: Jira.Timecode,
	fieldName: string
): string | undefined {
	const fieldValue = jiraIssue.fields.find(
		(field) => field.value === fieldName
	)?.label;
	if (fieldValue === "NoValueForFieldOnIssue") {
		return undefined;
	}
	return fieldValue;
}
 */
/* function getEpicName(jiraIssue: Jira.Timecode): string | undefined {
	return getField(jiraIssue, CUSTOM_FIELDS.epicName);
} */

/* function getEpicLink(jiraIssue: Jira.Timecode): string | undefined {
	return getField(jiraIssue, CUSTOM_FIELDS.epicLink);
} */

/* function getLabels(jiraIssue: Jira.Timecode): string[] {
	const labelsString = getField(jiraIssue, CUSTOM_FIELDS.labels);
	if (labelsString === undefined) {
		return [];
	}
	return labelsString.split(",").map((label) => label.trim());
} */
