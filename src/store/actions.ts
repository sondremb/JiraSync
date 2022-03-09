interface TAction<TKey extends string, TPayload> {
	kind: TKey;
	payload: TPayload;
}

type ActionCreator<TKey extends string, TPayload> = (
	payload: TPayload
) => TAction<TKey, TPayload>;

function createAction<TKey extends string>(key: TKey) {
	return function <TPayload>(): ActionCreator<TKey, TPayload> {
		return (payload: TPayload) => ({
			kind: key,
			payload,
		});
	};
}

export const setPasswordAction = createAction("SET_PASSWORD")<string>();
export const setUsernameAction = createAction("SET_USERNAME")<string>();

export type Action =
	| ReturnType<typeof setPasswordAction>
	| ReturnType<typeof setUsernameAction>;
