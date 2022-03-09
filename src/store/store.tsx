import React, { createContext, Dispatch, useContext, useReducer } from "react";
import { Action } from "./actions";
import { initialState, reducer, StoreState } from "./reducer";

interface StateAndDispatch {
	state: StoreState;
	dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StateAndDispatch | undefined>(undefined);

export const useStore = (): StateAndDispatch => {
	const value = useContext(StoreContext);
	if (value === undefined) throw Error("Store was not set");
	return value;
};

export const Store: React.FC = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			{children}
		</StoreContext.Provider>
	);
};
