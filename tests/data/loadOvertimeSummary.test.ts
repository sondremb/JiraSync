import { describe, expect, test, vi } from "vitest";
import { overtimeSummaryFromBekk } from "../../src/data/loadOvertimeSummary";

vi.mock("../../src/data/bekkclient", () => ({ bekkClient: {} }));
vi.mock("../../src/login/bekk/bekkLogin", () => ({ getEmployeeId: () => 42 }));

// Responses from Bekk dev, November and December 2026.
const november = {
	year: 2026,
	month: 11,
	fromWeek: 44,
	toWeek: 48,
	flexBalanceHours: -0.5,
	overtimeHours: 9.5,
	hoursForSigning: {
		mandatoryPayout: 1.5,
		mandatoryFlex: 0.5,
		allocatable: 7.5,
	},
};

describe("overtimeSummaryFromBekk", () => {
	test("maps the hours for signing", () => {
		expect(overtimeSummaryFromBekk(november)).toEqual({
			month: "2026-11",
			fromWeek: 44,
			toWeek: 48,
			overtimeHours: 9.5,
			flexBalanceHours: -0.5,
			mandatoryFlex: 0.5,
			mandatoryPayout: 1.5,
			allocatable: 7.5,
		});
	});

	test("drops a half-year clearing with nothing to clear", () => {
		const december = {
			...november,
			month: 12,
			hoursForSigning: {
				...november.hoursForSigning,
				halfYearFlexClearing: {
					flexBalanceForPayout: 0,
					flexBalanceForDeletion: -0,
				},
			},
		};
		expect(overtimeSummaryFromBekk(december)).not.toHaveProperty(
			"halfYearClearing",
		);
	});

	test("keeps a half-year clearing that pays out or deletes flex hours", () => {
		const december = {
			...november,
			month: 12,
			hoursForSigning: {
				...november.hoursForSigning,
				halfYearFlexClearing: {
					flexBalanceForPayout: 1,
					flexBalanceForDeletion: 2.5,
				},
			},
		};
		expect(overtimeSummaryFromBekk(december).halfYearClearing).toEqual({
			payoutHours: 1,
			deletedHours: 2.5,
		});
	});
});
