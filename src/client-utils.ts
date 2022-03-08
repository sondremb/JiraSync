import { AxiosResponse } from "axios";
import { useState } from "react";

interface CallableRequestInput<TReturn, TParams> {
	requestFunction: (body: TParams) => Promise<AxiosResponse<TReturn>>;
	onSuccess?: (response: TReturn, requestData: TParams) => void;
}

interface CallableRequestReturn<TReturn, TParams> {
	data: TReturn | undefined;
	loading: boolean;
	execute: (body: TParams) => void;
}

export function useCallableRequest<TReturn, TParams>(
	input: CallableRequestInput<TReturn, TParams>
): CallableRequestReturn<TReturn, TParams> {
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
			.finally(() => setLoading(false));
	}
	return {
		data,
		loading,
		execute,
	};
}
