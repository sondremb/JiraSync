import { useQuery } from "@tanstack/react-query";
import { loadProjects } from "./jira/loadProjects";

const tenMinutes = 10 * 60 * 1000;

export function useJiraProjects() {
	return useQuery({
		queryKey: ["jira", "projects"],
		staleTime: tenMinutes,
		queryFn: loadProjects,
	});
}
