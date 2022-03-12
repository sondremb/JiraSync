import { BekkId, BekkTimecodeMap, Jira } from "./types";

export enum UdirBekkIds {
	NyGjennomføring = 1001498,
	PASEksamen = 1000752,
	PASPrøver = 1000890,
	Pålogging = 1000854,
	Systemoversikt = 1002326,
	UBAS = 1002497,
}

export const knownBekkTimecodes: BekkTimecodeMap = {
	[UdirBekkIds.NyGjennomføring]: {
		id: UdirBekkIds.NyGjennomføring,
		code: "UTA1077",
		name: "Nytt gjennomføringssystem",
		isUdir: true,
	},
	[UdirBekkIds.PASEksamen]: {
		id: UdirBekkIds.PASEksamen,
		code: "UTA1065",
		name: "PAS Eksamen forvaltning",
		isUdir: true,
	},
	[UdirBekkIds.PASPrøver]: {
		id: UdirBekkIds.PASPrøver,
		code: "UTA1068",
		name: "PAS Prøver forvaltning",
		isUdir: true,
	},
	[UdirBekkIds.Pålogging]: {
		id: UdirBekkIds.Pålogging,
		code: "UTA1067",
		name: "Påloggingssystemet forvaltning",
		isUdir: true,
	},
	[UdirBekkIds.Systemoversikt]: {
		id: UdirBekkIds.Systemoversikt,
		code: "UTA1092",
		name: "Systemoversikten",
		isUdir: true,
	},
	[UdirBekkIds.UBAS]: {
		id: UdirBekkIds.UBAS,
		code: "UTA1097",
		name: "UBAS",
		isUdir: true,
	},
};

interface TimecodeSelector {
	selector: (jiraIssue: Jira.Timecode) => boolean;
	timecodeId: BekkId;
}

const jiraToTimecodeMap: TimecodeSelector[] = [
	{
		selector: (jiraIssue) => {
			const nyttGjennomforingssystemLabel = "EPS felles";
			const deliveryField = jiraIssue.fields.find((item) => item.value);
			return deliveryField?.label === nyttGjennomforingssystemLabel;
		},
		timecodeId: UdirBekkIds.NyGjennomføring,
	},
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
];

export const bekkIdFromJiraTimecode = (jiraIssue: Jira.Timecode) => {
	for (const { selector, timecodeId } of jiraToTimecodeMap) {
		if (selector(jiraIssue)) return timecodeId;
	}
	// TODO error-store
	console.error("Fant ingen Bekk-timekode tilsvarende:", jiraIssue);
	return -1;
};
