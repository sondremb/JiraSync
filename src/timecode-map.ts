import { componentId, JiraProjectKey } from "./data/issue";
import { Jql, Ruleset as Ruleset, RulesetId } from "./rules";
import { BekkId } from "./types";

const bekkId = (n: number): BekkId => n as BekkId;

export const FrivilligKompetanseByggingId = bekkId(1786);

export const UdirBekkIds = {
	UTA1065PasEksamenForvaltning: bekkId(1000752),
	UTA1068PasPrøverForvaltning: bekkId(1000890),
	UTA1067PåloggingssystemetForvaltning: bekkId(1000854),
	UTA1081PasForvaltningInteraksjonsdesignere: bekkId(1001717),
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
	UTA1129PasNyutviklingInteraksjonsdesignere: bekkId(1003617),
	UTA1131HflBriskNyutvikling: bekkId(1003625),
	UTA1134VeikartForEksamenOgPrøver: bekkId(1003628),

	// ny kontrakt
	UTA1135PasEksamenForvaltningSSAB: bekkId(1003648),
	UTA1136PasEksamenNyutviklingSSAB: bekkId(1003649),
	UTA1137PasPrøverForvaltningSSAB: bekkId(1003650),
	UTA1138PasPrøverNyutviklingSSAB: bekkId(1003651),
	UTA1139PasForvaltingInteraksjonsdesignereSSAB: bekkId(1003652),
	UTA1130UidpForvaltningSSAB: bekkId(1003618),
	UTA1143UidpNyutviklingSSAB: bekkId(1003780),
	UTA1145BistandTilEksamensTjenestenSSAB: bekkId(1003823),
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
	description: "For deg som er på PASX, PASP eller UIDP på ny kontrakt",
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
		{
			projectKey: ProjectKeys.UIDP,
			jql: `component = ${ComponentIds.UidpNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1143UidpNyutviklingSSAB,
		},
		{
			projectKey: ProjectKeys.UIDP,
			timecode: UdirBekkIds.UTA1130UidpForvaltningSSAB,
		},
	],
};

export const oldPasDesignRuleSet: Ruleset = {
	name: "Gamle PAS-designerregler",
	description: "For deg som er designer i PASP eller PASX på gammel kontrakt",
	id: "old-pas-design-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.PASP,
			jql: `component = ${ComponentIds.PaspNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1129PasNyutviklingInteraksjonsdesignere,
		},
		{
			projectKey: ProjectKeys.PASX,
			jql: `component = ${ComponentIds.PasxNyutvikling}` as Jql,
			timecode: UdirBekkIds.UTA1129PasNyutviklingInteraksjonsdesignere,
		},
		{
			projectKey: ProjectKeys.PASP,
			timecode: UdirBekkIds.UTA1081PasForvaltningInteraksjonsdesignere,
		},
		{
			projectKey: ProjectKeys.PASX,
			timecode: UdirBekkIds.UTA1081PasForvaltningInteraksjonsdesignere,
		},
	],
};

export const newPasDesignRuleSet: Ruleset = {
	name: "Nye PAS-designerregler",
	description: "For deg som er designer i PASP eller PASX på ny kontrakt",
	id: "new-pas-design-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.PASP,
			timecode: UdirBekkIds.UTA1139PasForvaltingInteraksjonsdesignereSSAB,
		},
		{
			projectKey: ProjectKeys.PASX,
			timecode: UdirBekkIds.UTA1139PasForvaltingInteraksjonsdesignereSSAB,
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
			timecode: UdirBekkIds.UTA1131HflBriskNyutvikling,
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

export const adrianRuleSet: Ruleset = {
	name: "Adrians regler",
	description: "For deg som er Adrian Kortyczko",
	id: "adrian-rules" as RulesetId,
	rules: [
		{
			projectKey: ProjectKeys.PASP,
			timecode: UdirBekkIds.UTA1145BistandTilEksamensTjenestenSSAB,
		},
	],
};
