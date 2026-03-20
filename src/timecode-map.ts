import { JiraIssue } from "./data/issue";
import { BekkId } from "./types";

export const FrivilligKompetanseByggingId = 1786;

export enum UdirBekkIds {
	UTA1065PasEksamenForvaltning = 1000752,
	UTA1068PasPrøverForvaltning = 1000890,
	UTA1067PåloggingssystemetForvaltning = 1000854,
	UTA1092Systemoversikt = 1002326,
	UTA1097Ubas = 1002497,
	UTA1109BistandTilHelhetligDesign = 1002899,
	UTA1090HflBrisk = 1002302,
	UTA1110HflForvaltning = 1003011,
	UTA1111HøringOgUndersøkelser = 1003012,
	UTA1119HflSkjemaVertikal = 1003290,
	UTA1113FellesDesignsystemForvaltning = 1003088,
	UTA1121KiLab = 1003373,
	UTA1122HflSommerKi = 1003386,
	UTA1124HflEkstraTildeling = 1003471,
	UTA1127PasxNytuvikling = 1003615,
	UTA1128PaspNytuvikling = 1003616,
	UTA1129PasDesignNytuvikling = 1003617,
	UTA1130UidpNytuvikling = 1003618,
	UTA1131HflBriskNytuvikling = 1003625,
}

enum ComponentId {
	PaspNyutvikling = "10290",
	PasxNyutvikling = "10121",
	UidpNyutvikling = "10677",
	HflBriskNyutvikling = "10073",
}

interface TimecodeSelector {
	selector: (jiraIssue: JiraIssue) => boolean;
	timecodeId: BekkId;
}

const jiraToTimecodeMap: TimecodeSelector[] = [
	{
		selector: (jiraIssue) => {
			if (!/PASX.*/.test(jiraIssue.key)) {
				return false;
			}
			return jiraIssue.components.includes(ComponentId.PasxNyutvikling);
		},
		timecodeId: UdirBekkIds.UTA1127PasxNytuvikling,
	},
	{
		selector: (jiraIssue) => {
			return /PASX.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1065PasEksamenForvaltning,
	},
	{
		selector: (jiraIssue) => {
			if (!/PASP.*/.test(jiraIssue.key)) {
				return false;
			}
			return jiraIssue.components.includes(ComponentId.PaspNyutvikling);
		},
		timecodeId: UdirBekkIds.UTA1128PaspNytuvikling,
	},
	{
		selector: (jiraIssue) => {
			return /PASP.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1068PasPrøverForvaltning,
	},
	{
		selector: (jiraIssue) => {
			if (!/IDPF.*/.test(jiraIssue.key)) {
				return false;
			}
			return jiraIssue.components.includes(ComponentId.UidpNyutvikling);
		},
		timecodeId: UdirBekkIds.UTA1130UidpNytuvikling,
	},
	{
		selector: (jiraIssue) => {
			return /IDPF.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1067PåloggingssystemetForvaltning,
	},
	{
		selector: (jiraIssue) => {
			return /SO.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1092Systemoversikt,
	},
	{
		selector: (jiraIssue) => {
			return /UBAS.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1097Ubas,
	},
	{
		selector: (jiraIssue) => {
			return /DESIGN.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1109BistandTilHelhetligDesign,
	},
	{
		selector: (jiraIssue) => {
			return /DESIGN.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1113FellesDesignsystemForvaltning,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			return jiraIssue.components.includes(ComponentId.HflBriskNyutvikling);
		},
		timecodeId: UdirBekkIds.UTA1131HflBriskNytuvikling,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			if (jiraIssue.components.includes(ComponentId.HflBriskNyutvikling)) {
				return false;
			}
			if (jiraIssue.epicLink === null) {
				return false;
			}
			return /HFL-7191/.test(jiraIssue.epicLink);
		},
		timecodeId: UdirBekkIds.UTA1090HflBrisk,
	},
	{
		selector: (jiraIssue) => {
			if (!/HSS.*/.test(jiraIssue.key)) {
				return false;
			}
			if (jiraIssue.epicLink === null) {
				return false;
			}
			return /HSS-1030/.test(jiraIssue.epicLink);
		},
		timecodeId: UdirBekkIds.UTA1119HflSkjemaVertikal,
	},
	{
		selector: (jiraIssue) => {
			return /HSS.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1111HøringOgUndersøkelser,
	},
	{
		selector: (jiraIssue) => {
			return /HFL.*/.test(jiraIssue.key);
		},
		timecodeId: UdirBekkIds.UTA1110HflForvaltning,
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
