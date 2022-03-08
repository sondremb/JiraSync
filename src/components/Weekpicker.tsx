import React from "react";
import { colors, Datepicker, DatepickerProps } from "@udir/lisa";
import styled from "styled-components";
import { Moment } from "moment";
import { getStartAndEndOfWeek } from "../Utils/dateUtils";
import moment from "moment";

interface Props
	extends Pick<
		DatepickerProps,
		"label" | "description" | "placeholder" | "disabled" | "id" | "closeOnClick"
	> {
	start: Moment;
	end: Moment;
	setStart: (start: Moment) => void;
	setEnd: (end: Moment) => void;
}

const StyledDatepicker = styled(Datepicker)`
	.react-datepicker__week {
		position: relative;
		&::after {
			content: "";
			position: absolute;
			top: 5px;
			left: 0;
			background-color: rgba(72, 91, 107, 0.3);
			display: block;
			width: 100%;
			height: 28px;
			border-radius: 999px;
			transform: scale(0);
			transition: transform 0.3s ease;
			pointer-events: none;
		}

		&:hover::after {
			transform: scale(1);
		}
	}

	.react-datepicker__day {
		margin: 1px 0;
		width: 38px;
		height: 38px;
		line-height: 38px;
		&::after {
			content: none;
		}
	}

	.react-datepicker__day--selected {
		background-color: inherit;
		&::before {
			content: "";
			position: absolute;
			top: 5px;
			left: 5px;
			background-color: ${colors.utvidetPrimærpalett.stålblå35.hex};
			display: block;
			width: 28px;
			height: 28px;
			border-radius: 999px;
			pointer-events: none;
			transform: scale(1);
			z-index: -1;
		}
	}
`;

export const Weekpicker: React.FC<Props> = (props) => {
	const onChange = (value: Date) => {
		const [start, end] = getStartAndEndOfWeek(moment(value));
		props.setStart(start);
		props.setEnd(end);
	};
	return (
		<StyledDatepicker
			value={props.start.toDate()}
			onChange={onChange}
			{...props}
		/>
	);
};
