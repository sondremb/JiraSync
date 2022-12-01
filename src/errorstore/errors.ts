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

export const JIRA_CAPTCHA = "JIRA_CAPTCHA";
export const JIRA_LOGIN = "JIRA_LOGIN";
export const NETLIFY_MISSING_AUTH = "NETLIFY_MISSING_AUTH";
export const NETLIFY_MISSING_DATES = "NETLIFY_MISSING_DATES";
export const UNKNOWN_NETLIFY_ERROR = "UNKNOWN_NETLIFY_ERROR";

export const jiraCaptchaError = createEmptyAction(JIRA_CAPTCHA);
export const jiraLoginError = createEmptyAction(JIRA_LOGIN);
export const netlifyMissingAuthError = createEmptyAction(NETLIFY_MISSING_AUTH);
export const netlifyMissingDatesError = createEmptyAction(
	NETLIFY_MISSING_DATES
);
export const unknownNetlifyError = createAction(
	UNKNOWN_NETLIFY_ERROR
)<string>();
export const unknownError = createEmptyAction("UNKNOWN");
export const resetErrorAction = createEmptyAction("RESET");

export type ErrorStoreError =
	| typeof jiraCaptchaError
	| typeof jiraLoginError
	| typeof netlifyMissingAuthError
	| typeof netlifyMissingDatesError
	| ReturnType<typeof unknownNetlifyError>
	| typeof unknownError;

export type ErrorStoreAction = ErrorStoreError | typeof resetErrorAction;
