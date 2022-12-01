import { Reducer } from "react";
import { loadPassword, loadUserName } from "../Utils/localstorageUtils";
import { Action } from "./actions";

export interface StoreState {
	jiraUsername: string;
	jiraPassword: string;
}

export const initialState: StoreState = {
	jiraUsername: loadUserName() ?? "",
	jiraPassword: loadPassword() ?? "",
};

export const reducer: Reducer<StoreState, Action> = (
	state: StoreState,
	action: Action
): StoreState => {
	switch (action.kind) {
		case "SET_PASSWORD": {
			return { ...state, jiraPassword: action.payload };
		}
		case "SET_USERNAME": {
			return { ...state, jiraUsername: action.payload };
		}
	}
};
