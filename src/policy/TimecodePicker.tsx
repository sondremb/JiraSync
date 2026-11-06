import { Combobox } from "@digdir/designsystemet-react";
import React, { useMemo } from "react";
import { useAllTimecodes } from "../data/useAllTimecodes";
import {
	matchesTimecode,
	offeredTimecodes,
	timecodeLabel,
} from "../policies/timecodeOptions";

/** Single-select over every active Bekk timecode. The list is long, so it is virtualized. */
export const TimecodePicker: React.FC<{
	value: number | null;
	onChange: (timecode: number | null) => void;
	error?: string;
}> = ({ value, onChange, error }) => {
	const { data, isPending, isError } = useAllTimecodes();
	const options = useMemo(
		() => offeredTimecodes(data ?? [], value),
		[data, value],
	);

	return (
		<Combobox
			label="Timekode"
			virtual
			loading={isPending}
			loadingLabel="Henter timekoder …"
			filter={(input, option) => matchesTimecode(input, option.label)}
			value={value === null ? [] : [String(value)]}
			onValueChange={([selected]) =>
				onChange(selected === undefined ? null : Number(selected))
			}
			error={
				error ?? (isError ? "Kunne ikke hente timekoder fra Bekk." : undefined)
			}
		>
			<Combobox.Empty>Ingen timekoder passer</Combobox.Empty>
			{options.map((option) => (
				<Combobox.Option key={option.id} value={String(option.id)}>
					{timecodeLabel(option)}
				</Combobox.Option>
			))}
		</Combobox>
	);
};
