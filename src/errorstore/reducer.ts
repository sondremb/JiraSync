import { Reducer } from "react";
import { ErrorStoreAction, ErrorStoreError } from "./errors";

export interface ErrorStoreState {
	error: ErrorStoreError | null;
}

export const initialState: ErrorStoreState = {
	error: null,
};

export const reducer: Reducer<ErrorStoreState, ErrorStoreAction> = (
	state,
	action
) => {
	switch (action.kind) {
		case "JIRA_CAPTCHA":
		case "JIRA_LOGIN":
		case "NETLIFY_MISSING_AUTH":
		case "NETLIFY_MISSING_DATES":
		case "UNKNOWN_NETLIFY_ERROR":
		case "UNKNOWN":
			return {
				...state,
				error: action,
			};
		case "RESET":
			return {
				...state,
				error: null,
			};
	}
};
