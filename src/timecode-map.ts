import { componentId, JiraIssue } from "./data/issue";
import { BekkId } from "./types";

const bekkId = (n: number): BekkId => n as BekkId;

export const FrivilligKompetanseByggingId = bekkId(1786);

export const UdirBekkIds = {
	UTA1065PasEksamenForvaltning: bekkId(1000752),
	UTA1068PasPrøverForvaltning: bekkId(1000890),
	UTA1067PåloggingssystemetForvaltning: bekkId(1000854),
	UTA1092Systemoversikt: bekkId(1002326),
	UTA1097Ubas: bekkId(1002497),
	UTA1109BistandTilHelhetligDesign: bekkId(1002899),
	UTA1090HflBrisk: bekkId(1002302),
	UTA1110HflForvaltning: bekkId(1003011),
	UTA1111HøringOgUndersøkelser: bekkId(1003012),
	UTA1119HflSkjemaVertikal: bekkId(1003290),
	UTA1113FellesDesignsystemForvaltning: bekkId(1003088),
	UTA1121KiLab: bekkId(1003373),
	UTA1122HflSommerKi: bekkId(1003386),
	UTA1124HflEkstraTildeling: bekkId(1003471),
	UTA1127PasxNytuvikling: bekkId(1003615),
	UTA1128PaspNytuvikling: bekkId(1003616),
	UTA1129PasDesignNytuvikling: bekkId(1003617),
	UTA1130UidpNytuvikling: bekkId(1003618),
	UTA1131HflBriskNytuvikling: bekkId(1003625),
} as const;

const ComponentIds = {
	PaspNyutvikling: componentId("10290"),
	PasxNyutvikling: componentId("10121"),
	UidpNyutvikling: componentId("10677"),
	HflBriskNyutvikling: componentId("10073"),
} as const;

const udirIdSet = new Set<BekkId>(Object.values(UdirBekkIds));

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
			return jiraIssue.components.includes(ComponentIds.PasxNyutvikling);
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
			return jiraIssue.components.includes(ComponentIds.PaspNyutvikling);
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
			return jiraIssue.components.includes(ComponentIds.UidpNyutvikling);
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
			return jiraIssue.components.includes(ComponentIds.HflBriskNyutvikling);
		},
		timecodeId: UdirBekkIds.UTA1131HflBriskNytuvikling,
	},
	{
		selector: (jiraIssue) => {
			if (!/HFL.*/.test(jiraIssue.key)) {
				return false;
			}
			if (jiraIssue.components.includes(ComponentIds.HflBriskNyutvikling)) {
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
	return bekkId(-1);
};

export const isUdir = (timecodeId: BekkId | undefined): boolean =>
	timecodeId !== undefined && udirIdSet.has(timecodeId);
