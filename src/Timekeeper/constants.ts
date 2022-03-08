import { TKTimecode } from "../types_OLD";

export enum TKId {
	Rekruttering = 35,
	Kompetansebygging = 129,
	FrivilligKompetanse = 1786,
	NyGjennomføring = 1001498,
	PASEksamen = 1000752,
	PASPrøver = 1000890,
	Pålogging = 1000854,
	Systemoversikt = 1002326,
}

export const timeCodeFromId = (timecodeId: number): TKTimecode => {
	const map: Record<TKId, TKTimecode> = {
		[TKId.Rekruttering]: {
			short: "REK1000",
			long: "Rekrutteringsaktiviteter og intervjuer",
			isPAS: false,
		},
		[TKId.Kompetansebygging]: {
			short: "KOM1001",
			long: "Kompetansebygging",
			isPAS: false,
		},
		[TKId.FrivilligKompetanse]: {
			short: "KOM1000",
			long: "Frivillig kompetansebygging",
			isPAS: false,
		},
		[TKId.NyGjennomføring]: {
			short: "UTA1077",
			long: "Nytt gjennomføringssystem",
			isPAS: true,
		},
		[TKId.PASEksamen]: {
			short: "UTA1065",
			long: "PAS Eksamen forvaltning",
			isPAS: true,
		},
		[TKId.PASPrøver]: {
			short: "UTAXXXX",
			long: "PAS Prøver forvaltning",
			isPAS: true,
		},
		[TKId.Pålogging]: {
			short: "UTAXXXX",
			long: "IDPF Påloggingssystemet Forvaltning",
			isPAS: true,
		},
		[TKId.Systemoversikt]: {
			short: "UTAXXXX",
			long: "Systemoversikten",
			isPAS: true,
		},
	};
	let timecode = map[timecodeId as TKId];
	if (!timecode) {
		console.error(`Missing timecode mapping for ${timecodeId}`);
		timecode = {
			short: "ERRXXXX",
			long: "Ukjent timekode",
			isPAS: false,
		};
	}
	return timecode;
};
