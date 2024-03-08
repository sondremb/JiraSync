import { TimecodeEssentialsDTO } from "./bekk-api/data-contracts";
import { BekkId, Jira } from "./types";

export const FrivilligKompetanseByggingId = 1786;

export enum UdirBekkIds {
	PASEksamen = 1000752,
	PASPrøver = 1000890,
	Pålogging = 1000854,
	Systemoversikt = 1002326,
	UBAS = 1002497,
	BistandTilHelhetligDesign = 1002899,
	HFL = 1003011,
	HSS = 1003012,
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
