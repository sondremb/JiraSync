import { describe, expect, test } from "vitest";
import { IsoDate, IsoMonth } from "../../src/date-time/IsoWeek";
import {
	oneMonthAtATimeNotice,
	overtimeDialogTitle,
} from "../../src/components/lockMessages";

describe("lock messages", () => {
	test("titles the overtime dialog with the month and its weeks", () => {
		expect(
			overtimeDialogTitle({
				month: IsoMonth.parse("2026-11"),
				fromWeek: 44,
				toWeek: 48,
				overtimeHours: 9.5,
				flexBalanceHours: -0.5,
				mandatoryFlex: 0.5,
				mandatoryPayout: 1.5,
				allocatable: 7.5,
			}),
		).toBe("Overtid for november (uke 44–48)");
	});

	test("asks to lock through the first month end", () => {
		expect(oneMonthAtATimeNotice(IsoDate.parse("2026-11-30"))).toBe(
			"Overtid må signeres for én måned om gangen. Lås først timer til og med mandag 30. november.",
		);
	});
});
