import { Reducer } from "react";
import { knownBekkTimecodes } from "../timecode-map";
import { BekkTimecodeMap, JiraTimecodeMap } from "../types";
import { loadPassword, loadUserName } from "../Utils/localstorageUtils";
import { Action } from "./actions";

export interface StoreState {
	jiraUsername: string;
	jiraPassword: string;
	bekkTimecodes: BekkTimecodeMap;
	jiraTimecodes: JiraTimecodeMap;
}

export const initialState: StoreState = {
	jiraUsername: loadUserName() ?? "",
	jiraPassword: loadPassword() ?? "",
	bekkTimecodes: knownBekkTimecodes,
	jiraTimecodes: {},
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
		case "ADD_BEKK_TIMECODES": {
			let newTimecodes: BekkTimecodeMap = {};
			for (const timecode of action.payload) {
				newTimecodes[timecode.id] = timecode;
			}
			return {
				...state,
				bekkTimecodes: {
					...state.bekkTimecodes,
					...newTimecodes,
				},
			};
		}
		case "ADD_JIRA_TIMECODES": {
			let newTimecodes: JiraTimecodeMap = {};
			for (const timecode of action.payload) {
				newTimecodes[timecode.key] = timecode;
			}
			return {
				...state,
				jiraTimecodes: {
					...state.jiraTimecodes,
					...newTimecodes,
				},
			};
		}
	}
};
