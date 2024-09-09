import { TimecodeEssentialsDTO } from "./bekk-api/data-contracts";
import { CUSTOM_FIELDS } from "./jira-client";
import { BekkId, Jira } from "./types";

export const FrivilligKompetanseByggingId = 1786;

export enum UdirBekkIds {
	PASEksamen = 1000752,
	PASPrøver = 1000890,
	Pålogging = 1000854,
	Systemoversikt = 1002326,
	UBAS = 1002497,
	BistandTilHelhetligDesign = 1002899,
	HFLDataPlattform = 1002302,
	HFLInnsamlingsløsning = 1003162,
	HFL = 1003011,
	HSS = 1003012,
	DIT = 1003026,
}

interface TimecodeSelector {
	selector: (jiraIssue: Jira.Timecode) => boolean;
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
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			const epicName = getEpicName(jiraIssue);
			if (epicName === undefined) {
				return false;
			}
			return /data ?plattform/i.test(epicName) || /Tilda/i.test(epicName);
		},
		timecodeId: UdirBekkIds.HFLDataPlattform,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			const epicLink = getEpicLink(jiraIssue);
			if (epicLink === undefined) {
				return false;
			}
			return /HFL-6270/.test(epicLink);
		},
		timecodeId: UdirBekkIds.HFLInnsamlingsløsning,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			return getLabels(jiraIssue).includes("DIT");
		},
		timecodeId: UdirBekkIds.DIT,
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
];

export const bekkIdFromJiraTimecode = (jiraIssue: Jira.Timecode) => {
	for (const { selector, timecodeId } of jiraToTimecodeMap) {
		if (selector(jiraIssue)) return timecodeId;
	}
	// TODO error-store
	console.error("Fant ingen Bekk-timekode tilsvarende:", jiraIssue);
	return -1;
};

export const isUdir = (timecode: TimecodeEssentialsDTO): boolean =>
	timecode.id !== undefined && timecode.id in UdirBekkIds;

function getField(
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

function getEpicName(jiraIssue: Jira.Timecode): string | undefined {
	return getField(jiraIssue, CUSTOM_FIELDS.epicName);
}

function getEpicLink(jiraIssue: Jira.Timecode): string | undefined {
	return getField(jiraIssue, CUSTOM_FIELDS.epicLink);
}

function getLabels(jiraIssue: Jira.Timecode): string[] {
	const labelsString = getField(jiraIssue, CUSTOM_FIELDS.labels);
	if (labelsString === undefined) {
		return [];
	}
	return labelsString.split(",").map((label) => label.trim());
}
