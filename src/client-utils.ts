import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import {
	jiraCaptchaError,
	jiraLoginError,
	JIRA_CAPTCHA,
	JIRA_LOGIN,
	netlifyMissingAuthError,
	netlifyMissingDatesError,
	NETLIFY_MISSING_AUTH,
	NETLIFY_MISSING_DATES,
	unknownError,
	unknownNetlifyError,
	UNKNOWN_NETLIFY_ERROR,
} from "./errorstore/errors";
import { useErrorStore } from "./errorstore/store";

interface CallableRequestInput<TReturn, TParams> {
	requestFunction: (body: TParams) => Promise<AxiosResponse<TReturn>>;
	onSuccess?: (response: TReturn, requestData: TParams) => void;
}

interface CallableStatefulRequestReturn<TReturn, TParams> {
	data: TReturn | undefined;
	loading: boolean;
	execute: (body: TParams) => void;
}

interface CallableStatelessRequestReturn<TParams> {
	loading: boolean;
	execute: (body: TParams) => Promise<boolean>;
}

export function useCallableStatefulRequest<TReturn, TParams>(
	input: CallableRequestInput<TReturn, TParams>
): CallableStatefulRequestReturn<TReturn, TParams> {
	const { dispatch } = useErrorStore();
	const [data, setData] = useState<TReturn>();
	const [loading, setLoading] = useState(false);
	function execute(body: TParams) {
		setLoading(false);
		input
			.requestFunction(body)
			.then((res: AxiosResponse<TReturn>) => {
				setData(res.data);
				if (input.onSuccess) input.onSuccess(res.data, body);
			})
			.catch((err: AxiosError) => {
				const data: string = err.response?.data;
				switch (data) {
					case JIRA_CAPTCHA:
						dispatch(jiraCaptchaError);
						return;
					case JIRA_LOGIN:
						dispatch(jiraLoginError);
						return;
					case NETLIFY_MISSING_AUTH:
						dispatch(netlifyMissingAuthError);
						return;
					case NETLIFY_MISSING_DATES:
						dispatch(netlifyMissingDatesError);
						return;
				}
				if (data.startsWith(UNKNOWN_NETLIFY_ERROR)) {
					const eventId = data.split(" ")[1];
					dispatch(unknownNetlifyError(eventId));
				} else {
					// vi er ute i totalt ukjent farvann
					// dump feilmelding til console.error og gi generisk feilmelding i modalen
					handleUnknownError(err);
					dispatch(unknownError);
				}
			})
			.finally(() => setLoading(false));
	}
	return {
		data,
		loading,
		execute,
	};
}

export function useCallableStatelessRequest<TReturn, TParams>(
	input: CallableRequestInput<TReturn, TParams>
): CallableStatelessRequestReturn<TParams> {
	const { dispatch } = useErrorStore();
	const [loading, setLoading] = useState(false);
	function execute(body: TParams): Promise<boolean> {
		setLoading(false);
		return input
			.requestFunction(body)
			.then((res: AxiosResponse<TReturn>) => {
				if (input.onSuccess) input.onSuccess(res.data, body);
				return true;
			})
			.catch((err: AxiosError) => {
				// vi er ute i totalt ukjent farvann
				// dump feilmelding til console.error og gi generisk feilmelding i modalen
				handleUnknownError(err);
				dispatch(unknownError);
				return false;
			})
			.finally(() => setLoading(false));
	}
	return {
		loading,
		execute,
	};
}

const handleUnknownError = (error: AxiosError) => {
	if (error.response) {
		console.error("An unhandled error response was received");
		console.error("Response data: " + error.response.data);
		console.error("Status code: " + error.response.status);
		console.log("Headers: ", error.response.headers);
	} else if (error.request) {
		console.error("Request was made but no response was received");
		console.log("Error request: ", error.request);
	} else {
		console.error("An error occurred in setting up the request");
		console.error("Error message: ", error.message);
	}
	console.error("Error config: ", error.config);
};
