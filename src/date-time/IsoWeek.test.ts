import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { IsoDate, IsoWeek } from "./IsoWeek";

describe(".toParts", () => {
	test("It splits single digit weeks", () => {
		const parsed = IsoWeek.toParts("2024-W01" as IsoWeek);
		expect(parsed).toEqual({ year: 2024, week: 1 });
	});

	test("It parses double digit weeks", () => {
		const parsed = IsoWeek.toParts("2024-W10" as IsoWeek);
		expect(parsed).toEqual({ year: 2024, week: 10 });
	});
});

describe(".isValid", () => {
	test.each(["2024-W01", "2024-W10", "2026-W53"])(
		"It accepts valid week %s",
		(week) => {
			expect(IsoWeek.isValid(week)).toBe(true);
		}
	);

	test.each([
		"2024-W00", // week 0 does not exist
		"2024-W54", // week 54 does not exist
		"2024-W1", // week must be two digits
		"2024-01", // must have W
		"24-W01", // year must be four digits
		"2024W01", // must have hyphen
		"2024-W001", // week must be two digits
		"not-a-week", // just nonsense
		"", // empty string
	])("It rejects invalid week %s", (week) => {
		expect(IsoWeek.isValid(week)).toBe(false);
	});
});

describe(".parse", () => {
	test.each(["2024-W01", "2024-W10", "2026-W53"])(
		"It returns IsoWeek for valid week %s",
		(week) => {
			expect(IsoWeek.parse(week)).toBe(week);
		}
	);

	test.each([
		"2024-W00", // week 0 does not exist
		"2024-W54", // week 54 does not exist
		"2024-W1", // week must be two digits
		"2024-01", // must have W
		"24-W01", // year must be four digits
		"2024W01", // must have hyphen
		"2024-W001", // week must be two digits
		"not-a-week", // just nonsense
		"", // empty string
	])("It throws error invalid week %s", (week) => {
		expect(() => IsoWeek.parse(week)).toThrow();
	});
});

describe(".fromDate formatting", () => {
	test("It formats single digit weeks", () => {
		const startOfWeek = new Date("2024-12-30T23:00:00.000Z");
		expect(IsoWeek.fromDate(startOfWeek)).toBe("2025-W01");
	});

	test("It formats double digit weeks", () => {
		const startOfWeek = new Date("2024-03-04T23:00:00.000Z");
		expect(IsoWeek.fromDate(startOfWeek)).toBe("2024-W10");
	});
});

describe(".fromDate logic around around new years", () => {
	// ISO week bestemmes av hvilket år torsdagen i den uka tilhører

	test("When january 1st is thursday or earlier, it is current year", () => {
		// 1. januar 2025 er en onsdag
		// Altså er uka 30. desember 2024 - 5. januar 2025 ISO-week 2025-W01
		const mondayDecember30th = new Date("2024-12-30T12:00:00.000Z");
		expect(IsoWeek.fromDate(mondayDecember30th)).toBe("2025-W01");

		const wednesdayJanuary1st = new Date("2025-01-01T12:00:00.000Z");
		expect(IsoWeek.fromDate(wednesdayJanuary1st)).toBe("2025-W01");
	});

	test("When january 1st is friday or later, it is previous year", () => {
		// 1. januar 2027 er en fredag
		// Altså er uka 28. desember 2026 - 3. januar 2027 ISO-week 2026-W53
		const mondayDecember28th = new Date("2026-12-28T12:00:00.000Z");
		expect(IsoWeek.fromDate(mondayDecember28th)).toBe("2026-W53");

		const fridayJanuary1st = new Date("2027-01-01T12:00:00.000Z");
		expect(IsoWeek.fromDate(fridayJanuary1st)).toBe("2026-W53");
	});
});

describe("It uses norwegian time", () => {
	describe("When timezone is set to norway", () => {
		let originalTZ: string | undefined;
		beforeAll(() => {
			originalTZ = process.env.TZ;
			process.env.TZ = "Europe/Oslo";
		});

		afterAll(() => {
			process.env.TZ = originalTZ;
		});

		test("It does not change the week before 22:00 UTC during summer time", () => {
			const justBeforeMidnight = new Date("2025-06-29T21:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W26");
		});

		test("It changes the week after 22:00 UTC during summer time", () => {
			const justAfterMidnight = new Date("2025-06-29T22:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W27");
		});

		test("It does not change the week before 23:00 UTC during winter time", () => {
			const justBeforeMidnight = new Date("2025-12-21T22:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W51");
		});

		test("It changes the week after 23:00 UTC during winter time", () => {
			const justAfterMidnight = new Date("2025-12-21T23:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W52");
		});
	});

	describe("When timezone is set to something else entirely", () => {
		let originalTZ: string | undefined;
		beforeAll(() => {
			originalTZ = process.env.TZ;
			process.env.TZ = "Asia/Tokyo";
		});

		afterAll(() => {
			process.env.TZ = originalTZ;
		});

		test("It does not change the week before 22:00 UTC during summer time", () => {
			const justBeforeMidnight = new Date("2025-06-29T21:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W26");
		});

		test("It changes the week after 22:00 UTC during summer time", () => {
			const justAfterMidnight = new Date("2025-06-29T22:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W27");
		});

		test("It does not change the week before 23:00 UTC during winter time", () => {
			const justBeforeMidnight = new Date("2025-12-21T22:59:59.999Z");
			expect(IsoWeek.fromDate(justBeforeMidnight)).toBe("2025-W51");
		});

		test("It changes the week after 23:00 UTC during winter time", () => {
			const justAfterMidnight = new Date("2025-12-21T23:00:00.000Z");
			expect(IsoWeek.fromDate(justAfterMidnight)).toBe("2025-W52");
		});
	});
});

describe(".days", () => {
	test("It returns correct days", () => {
		const days = IsoWeek.days("2026-W53" as IsoWeek);
		expect(days).toEqual([
			"2026-12-28",
			"2026-12-29",
			"2026-12-30",
			"2026-12-31",
			"2027-01-01",
			"2027-01-02",
			"2027-01-03",
		]);
	});

	test.each(["2024-W01", "2024-W10", "2026-W53"])(
		"It maps back to same week",
		(week) => {
			const days = IsoWeek.days(week as IsoWeek);
			days.forEach((day) => {
				expect(IsoWeek.fromDate(IsoDate.toDate(day))).toBe(week);
			});
		}
	);
});

describe(".getDay", () => {
	test.each([0, 8, -1, 2.2])("It throws on invalid day %i", (day) => {
		expect(() => IsoWeek.getDay("2026-W53" as IsoWeek, day)).toThrow();
	});

	test.each([
		[1, "2026-12-28"],
		[2, "2026-12-29"],
		[3, "2026-12-30"],
		[4, "2026-12-31"],
		[5, "2027-01-01"],
		[6, "2027-01-02"],
		[7, "2027-01-03"],
	])("It returns correct day %i", (day, expected) => {
		expect(IsoWeek.getDay("2026-W53" as IsoWeek, day)).toBe(expected);
	});

	test.each([1, 2, 3, 4, 5, 6, 7])(
		"It corrresponds with .days for day %i",
		(day) => {
			expect(IsoWeek.getDay("2026-W53" as IsoWeek, day)).toBe(
				IsoWeek.days("2026-W53" as IsoWeek)[day - 1]
			);
		}
	);
});

describe(".monday", () => {
	test("It returns correct monday", () => {
		expect(IsoWeek.monday("2026-W53" as IsoWeek)).toBe("2026-12-28");
	});

	test.each(["2025-W41", "2025-W52", "2026-W53"])(
		"It corresponds with .days[0] for %s",
		(week) => {
			expect(IsoWeek.monday(week as IsoWeek)).toBe(
				IsoWeek.days(week as IsoWeek)[0]
			);
		}
	);

	test.each(["2025-W41", "2025-W52", "2026-W53"])(
		"It corresponds with .getDay(1) for %s",
		(week) => {
			expect(IsoWeek.monday(week as IsoWeek)).toBe(
				IsoWeek.getDay(week as IsoWeek, 1)
			);
		}
	);
});

describe(".sunday", () => {
	test("It returns correct sunday", () => {
		expect(IsoWeek.sunday("2026-W53" as IsoWeek)).toBe("2027-01-03");
	});

	test.each(["2025-W41", "2025-W52", "2026-W53"])(
		"It corresponds with .days[6] for %s",
		(week) => {
			expect(IsoWeek.sunday(week as IsoWeek)).toBe(
				IsoWeek.days(week as IsoWeek)[6]
			);
		}
	);

	test.each(["2025-W41", "2025-W52", "2026-W53"])(
		"It corresponds with .getDay(7) for %s",
		(week) => {
			expect(IsoWeek.sunday(week as IsoWeek)).toBe(
				IsoWeek.getDay(week as IsoWeek, 7)
			);
		}
	);
});

describe(".next", () => {
	test("It returns correct next week", () => {
		expect(IsoWeek.next("2026-W53" as IsoWeek)).toBe("2027-W01");
		expect(IsoWeek.next("2024-W01" as IsoWeek)).toBe("2024-W02");
	});
});

describe(".previous", () => {
	test("It returns correct previous week", () => {
		expect(IsoWeek.previous("2027-W01" as IsoWeek)).toBe("2026-W53");
		expect(IsoWeek.previous("2024-W02" as IsoWeek)).toBe("2024-W01");
	});
});
