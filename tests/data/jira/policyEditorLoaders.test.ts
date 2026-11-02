import { beforeEach, describe, expect, test, vi } from "vitest";
import { jiraClient } from "../../../src/data/jira/jiraclient";
import { loadProjectComponents } from "../../../src/data/jira/loadProjectComponents";
import { loadProjects } from "../../../src/data/jira/loadProjects";
import { validateJqlSyntax } from "../../../src/data/jira/validateJqlSyntax";

vi.mock("../../../src/data/jira/jiraclient", () => ({
	jiraClient: { GET: vi.fn(), POST: vi.fn() },
}));
const get = vi.mocked(jiraClient.GET);
const post = vi.mocked(jiraClient.POST);
const ok = (data: unknown) =>
	({ response: { ok: true, status: 200 }, data }) as never;

beforeEach(() => {
	get.mockReset();
	post.mockReset();
});

describe("loadProjects", () => {
	test("follows pages until the last one", async () => {
		get
			.mockResolvedValueOnce(
				ok({ isLast: false, values: [{ key: "AAA", name: "Alpha" }] }),
			)
			.mockResolvedValueOnce(
				ok({ isLast: true, values: [{ key: "BBB", name: "Beta" }] }),
			);

		await expect(loadProjects()).resolves.toEqual([
			{ key: "AAA", name: "Alpha" },
			{ key: "BBB", name: "Beta" },
		]);
		expect(get.mock.calls[1][1]).toMatchObject({
			params: { query: { startAt: 1 } },
		});
	});

	test("does not loop forever on an empty non-final page", async () => {
		get.mockResolvedValue(ok({ isLast: false, values: [] }));
		await expect(loadProjects()).resolves.toEqual([]);
		expect(get).toHaveBeenCalledTimes(1);
	});

	test("throws on a failed response", async () => {
		get.mockResolvedValueOnce({
			response: { ok: false, status: 500 },
		} as never);
		await expect(loadProjects()).rejects.toThrow();
	});
});

describe("loadProjectComponents", () => {
	test("returns id and name", async () => {
		get.mockResolvedValueOnce(ok([{ id: "10121", name: "Core", extra: 1 }]));
		await expect(loadProjectComponents("PASX")).resolves.toEqual([
			{ id: "10121", name: "Core" },
		]);
	});

	test("treats 404 (missing or no access) as no components", async () => {
		get.mockResolvedValueOnce({
			response: { ok: false, status: 404 },
		} as never);
		await expect(loadProjectComponents("NOPE")).resolves.toEqual([]);
	});

	test("throws on other failures", async () => {
		get.mockResolvedValueOnce({
			response: { ok: false, status: 500 },
		} as never);
		await expect(loadProjectComponents("PASX")).rejects.toThrow();
	});
});

describe("validateJqlSyntax", () => {
	test("asks Jira for syntax-only validation", async () => {
		post.mockResolvedValueOnce(ok({ queries: [{ query: "q" }] }));
		await expect(validateJqlSyntax("project = 'X'")).resolves.toEqual({
			ok: true,
		});
		expect(post).toHaveBeenCalledWith("/rest/api/3/jql/parse", {
			params: { query: { validation: "none" } },
			body: { queries: ["project = 'X'"] },
		});
	});

	test("returns Jira's errors", async () => {
		post.mockResolvedValueOnce(
			ok({ queries: [{ query: "q", errors: ["bad token"] }] }),
		);
		await expect(validateJqlSyntax("q")).resolves.toEqual({
			ok: false,
			errors: ["bad token"],
		});
	});

	test("throws when the request itself fails", async () => {
		post.mockResolvedValueOnce({ response: { ok: false } } as never);
		await expect(validateJqlSyntax("q")).rejects.toThrow();
	});
});
