import { useQuery } from "@tanstack/react-query";
import { loadProjectComponents } from "./jira/loadProjectComponents";

const tenMinutes = 10 * 60 * 1000;

export function useProjectComponents(projectKey: string) {
	const key = projectKey.trim();
	return useQuery({
		queryKey: ["jira", "components", key],
		staleTime: tenMinutes,
		queryFn: () => loadProjectComponents(key),
		enabled: key !== "",
	});
}
