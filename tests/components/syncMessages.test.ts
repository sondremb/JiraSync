import { describe, expect, test } from "vitest";
import { IsoDate } from "../../src/date-time/IsoWeek";
import {
	formatChangeCount,
	lockedDaysNotice,
} from "../../src/components/syncMessages";

describe("formatChangeCount", () => {
	test("singular for one, plural otherwise", () => {
		expect(formatChangeCount(1)).toBe("1 endring");
		expect(formatChangeCount(3)).toBe("3 endringer");
	});
});

describe("lockedDaysNotice", () => {
	const monday = IsoDate.parse("2025-02-03");
	const tuesday = IsoDate.parse("2025-02-04");

	test("says nothing can sync when the lock date is unknown", () => {
		expect(lockedDaysNotice(undefined, [monday])).toBe(
			"Låsedato er ukjent, så ingen timer kan synkroniseres.",
		);
	});

	test("lists the locked days otherwise", () => {
		expect(lockedDaysNotice(tuesday, [monday, tuesday])).toBe(
			`Låste dager stemmer ikke med Jira og blir ikke synkronisert: ${IsoDate.formatLong(monday)}, ${IsoDate.formatLong(tuesday)}.`,
		);
	});
});
