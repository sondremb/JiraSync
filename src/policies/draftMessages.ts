import { type DraftValidation, type IdError, type RuleErrors } from "./draft";

export const idErrorText: Record<IdError, string> = {
	required: "Id må fylles ut.",
	"invalid-format":
		"Id kan bare inneholde små bokstaver, tall og bindestrek, og kan ikke starte eller slutte med bindestrek.",
	reserved: "Denne id-en er reservert.",
	taken: "Et annet regelsett bruker allerede denne id-en.",
};

export const nameErrorText: Record<
	NonNullable<DraftValidation["name"]>,
	string
> = {
	required: "Navn må fylles ut.",
};

export const rulesErrorText: Record<
	NonNullable<DraftValidation["rules"]>,
	string
> = {
	empty: "Regelsettet må ha minst én regel.",
};

export const projectKeyErrorText: Record<
	NonNullable<RuleErrors["projectKey"]>,
	string
> = {
	required: "Prosjekt må fylles ut.",
};

export const timecodeErrorText: Record<
	NonNullable<RuleErrors["timecode"]>,
	string
> = {
	required: "Velg en timekode.",
	invalid: "Ugyldig timekode.",
};
