import { bekkClient } from "./bekkclient";

export interface TimecodeOption {
	id: number;
	code: string;
	name: string;
	active: boolean;
}

const idsPerRequest = 100;

/** Every timecode in Bekk (several thousand), trimmed to the fields the picker needs. */
export async function loadAllTimecodes(): Promise<TimecodeOption[]> {
	const { response, data } = await bekkClient.GET("/v3/timecodes", {
		params: { query: { Fields: "id,code,name,active" } },
	});
	if (!response.ok || !data) {
		throw new Error("Failed to fetch timecodes");
	}
	return data.flatMap(toOption);
}

/** Looks up specific timecodes. Ids Bekk does not return are absent from the result. */
export async function loadTimecodesByIds(
	ids: readonly number[],
): Promise<Map<number, TimecodeOption>> {
	const unique = [...new Set(ids)];
	const result = new Map<number, TimecodeOption>();
	for (let i = 0; i < unique.length; i += idsPerRequest) {
		const chunk = unique.slice(i, i + idsPerRequest);
		const { response, data } = await bekkClient.GET("/v3/timecodes", {
			params: { query: { Ids: chunk, Fields: "id,code,name,active" } },
		});
		if (!response.ok || !data) {
			throw new Error("Failed to fetch timecodes");
		}
		for (const option of data.flatMap(toOption)) {
			result.set(option.id, option);
		}
	}
	return result;
}

function toOption(raw: {
	id?: number;
	code?: string | null;
	name?: string | null;
	active?: boolean;
}): TimecodeOption[] {
	if (raw.id === undefined) {
		return [];
	}
	return [
		{
			id: raw.id,
			code: raw.code ?? "",
			name: raw.name ?? "",
			active: raw.active ?? true,
		},
	];
}
