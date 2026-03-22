import { componentId, JiraIssue, JiraProjectKey } from "./data/issue";
import { Jql, Ruleset as Ruleset, RulesetId } from "./rules";
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
	UTA1127PasEksamenNyutvikling: bekkId(1003615),
	UTA1128PaspNyutvikling: bekkId(1003616),
	UTA1129PasDesignNytuvikling: bekkId(1003617),
	UTA1130UidpNyutvikling: bekkId(1003618),
	UTA1131HflBriskNytuvikling: bekkId(1003625),
	UTA1134VeikartForEksamenOgPrøver: bekkId(1003628),

	// ny kontrakt
	UTA1135PasEksamenForvaltningSSAB: bekkId(1003648),
	UTA1136PasEksamenNyutviklingSSAB: bekkId(1003649),
	UTA1137PasPrøverForvaltningSSAB: bekkId(1003650),
	UTA1138PasPrøverNyutviklingSSAB: bekkId(1003651),
	UTA1139PasForvaltingInteraksjonsdesignereSSAB: bekkId(1003652),
} as const;

const ProjectKeys = {
	PASX: "PASX" as JiraProjectKey,
	PASP: "PASP" as JiraProjectKey,
	UIDP: "IDPF" as JiraProjectKey,
	HFL: "HFL" as JiraProjectKey,
	HSS: "HSS" as JiraProjectKey,
	SO: "SO" as JiraProjectKey,
	UBAS: "UBAS" as JiraProjectKey,
	DESIGN: "DESIGN" as JiraProjectKey,
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
		timecodeId: UdirBekkIds.UTA1127PasEksamenNyutvikling,
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
		timecodeId: UdirBekkIds.UTA1128PaspNyutvikling,
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
		timecodeId: UdirBekkIds.UTA1130UidpNyutvikling,
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

export const oldPasRuleSet: Ruleset = {
	name: "Gamle PAS-regler",
	description: "For deg som er på PASX, PASP eller UIDP på gammel kontrakt",
	id: "old-pas-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.PASX,
			jql: `component = ${ComponentIds.PasxNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1127PasEksamenNyutvikling,
		},
		{
			projectKey: ProjectKeys.PASX,
			timecode: UdirBekkIds.UTA1065PasEksamenForvaltning,
		},
		{
			projectKey: ProjectKeys.PASP,
			jql: `component = ${ComponentIds.PaspNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1128PaspNyutvikling,
		},
		{
			projectKey: ProjectKeys.PASP,
			timecode: UdirBekkIds.UTA1068PasPrøverForvaltning,
		},
		{
			projectKey: ProjectKeys.UIDP,
			jql: `component = ${ComponentIds.UidpNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1130UidpNyutvikling,
		},
		{
			projectKey: ProjectKeys.UIDP,
			timecode: UdirBekkIds.UTA1067PåloggingssystemetForvaltning,
		},
		{
			projectKey: ProjectKeys.SO,
			timecode: UdirBekkIds.UTA1092Systemoversikt,
		},
		{
			projectKey: ProjectKeys.UBAS,
			timecode: UdirBekkIds.UTA1097Ubas,
		},
	],
};

export const newPasRuleSet: Ruleset = {
	name: "Nye PAS-regler",
	description: "For deg som er på PASX eller PASP på ny kontrakt",
	id: "new-pas-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.PASX,
			jql: `component = ${ComponentIds.PasxNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1136PasEksamenNyutviklingSSAB,
		},
		{
			projectKey: ProjectKeys.PASX,
			timecode: UdirBekkIds.UTA1135PasEksamenForvaltningSSAB,
		},
		{
			projectKey: ProjectKeys.PASP,
			jql: `component = ${ComponentIds.PaspNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1138PasPrøverNyutviklingSSAB,
		},
		{
			projectKey: ProjectKeys.PASP,
			timecode: UdirBekkIds.UTA1137PasPrøverForvaltningSSAB,
		},
	],
};

export const otherRuleSet: Ruleset = {
	name: "Andre regler",
	description: "For deg som er på HFL/HSS eller designsystem",
	id: "other-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.HFL,
			jql: `component = ${ComponentIds.HflBriskNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1131HflBriskNytuvikling,
		},
		{
			projectKey: ProjectKeys.HFL,
			jql: `component != ${ComponentIds.HflBriskNyutvikling} AND "Epic Link" = HFL-7191` as Jql,
			timecode: UdirBekkIds.UTA1090HflBrisk,
		},
		{
			projectKey: ProjectKeys.HSS,
			jql: `"Epic Link" = HSS-1030` as Jql,
			timecode: UdirBekkIds.UTA1119HflSkjemaVertikal,
		},
		{
			projectKey: ProjectKeys.HSS,
			timecode: UdirBekkIds.UTA1111HøringOgUndersøkelser,
		},
		{
			projectKey: ProjectKeys.HFL,
			timecode: UdirBekkIds.UTA1110HflForvaltning,
		},
	],
};
