import { BekkTimecode, JiraTimecode } from "../types";

interface TAction<TKey extends string, TPayload> {
	kind: TKey;
	payload: TPayload;
}

interface TEmptyAction<TKey extends string> {
	kind: TKey;
}

type ActionCreator<TKey extends string, TPayload> = (
	payload: TPayload
) => TAction<TKey, TPayload>;

export function createAction<TKey extends string>(key: TKey) {
	return function <TPayload>(): ActionCreator<TKey, TPayload> {
		return (payload: TPayload) => ({
			kind: key,
			payload,
		});
	};
}

export function createEmptyAction<TKey extends string>(
	key: TKey
): TEmptyAction<TKey> {
	return { kind: key };
}

export const setPasswordAction = createAction("SET_PASSWORD")<string>();
export const setUsernameAction = createAction("SET_USERNAME")<string>();
export const addBekkTimecodesAction =
	createAction("ADD_BEKK_TIMECODES")<BekkTimecode[]>();
export const addJiraTimecodesAction =
	createAction("ADD_JIRA_TIMECODES")<JiraTimecode[]>();

export type Action =
	| ReturnType<typeof setPasswordAction>
	| ReturnType<typeof setUsernameAction>
	| ReturnType<typeof addBekkTimecodesAction>
	| ReturnType<typeof addJiraTimecodesAction>;
