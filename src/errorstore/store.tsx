import React, { createContext, Dispatch, useContext, useReducer } from "react";
import { ErrorStoreAction } from "./errors";
import { ErrorStoreState, initialState, reducer } from "./reducer";

interface StateAndDispatch {
	state: ErrorStoreState;
	dispatch: Dispatch<ErrorStoreAction>;
}

const ErrorStoreContext = createContext<StateAndDispatch | undefined>(
	undefined
);

export const useErrorStore = (): StateAndDispatch => {
	const value = useContext(ErrorStoreContext);
	if (value === undefined) throw Error("Errorstore ikke tilgjengelig");
	return value;
};

export const ErrorStore: React.FC = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	return (
		<ErrorStoreContext.Provider value={{ state, dispatch }}>
			{children}
		</ErrorStoreContext.Provider>
	);
};
