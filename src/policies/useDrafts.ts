import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Ruleset } from "../rules";
import {
	deleteDraft,
	getDraftStorage,
	loadDrafts,
	saveDraft,
} from "./draftStore";

const draftsQueryKey = ["policies", "drafts"];

/** Locally saved drafts. The one source for drafts, so every view sees saves and deletes. */
export function useDrafts(): Ruleset[] {
	const { data } = useQuery({
		queryKey: draftsQueryKey,
		staleTime: Infinity,
		queryFn: () => loadDrafts(getDraftStorage()),
		initialData: () => loadDrafts(getDraftStorage()),
	});
	return data;
}

export function useSaveDraft() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (draft: Ruleset) => saveDraft(getDraftStorage(), draft),
		onSuccess: (drafts) => client.setQueryData(draftsQueryKey, drafts),
	});
}

export function useDeleteDraft() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => deleteDraft(getDraftStorage(), id),
		onSuccess: (drafts) => client.setQueryData(draftsQueryKey, drafts),
	});
}
