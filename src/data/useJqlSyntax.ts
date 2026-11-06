import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { validateJqlSyntax } from "./jira/validateJqlSyntax";
import { effectiveJql } from "../policies/editorState";

const debounceMs = 500;

/**
 * Debounced syntax check of the JQL a rule will actually run
 * (`project = 'KEY' AND (…)`). Advisory only: it never checks that
 * projects or components exist.
 */
export function useJqlSyntax(projectKey: string, jql: string) {
	const fullJql = effectiveJql(projectKey, jql);
	const debounced = useDebounced(fullJql, debounceMs);

	return useQuery({
		queryKey: ["jira", "jql-syntax", debounced],
		staleTime: Infinity,
		queryFn: () => validateJqlSyntax(debounced!),
		enabled: debounced !== undefined && jql.trim() !== "",
		retry: false,
	});
}

function useDebounced<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);
	return debounced;
}
