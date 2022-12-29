import { FlexRow, Icon } from "@udir/lisa";
import { borderRadius, rem } from "@udir/lisa-tokens";
import { Moment } from "moment";
import React from "react";
import styled, { css } from "styled-components";
import { useLockDate } from "../../data/useLockDate";

interface Props {
	day: Moment;
	onClick: () => void;
}

export const LockDateButton: React.FC<Props> = (props) => {
	const { lockDate } = useLockDate();
	const disabled = lockDate === undefined || props.day.isSameOrBefore(lockDate);

	const onClick = () => {
		if (!disabled) {
			props.onClick();
		}
	};

	return (
		<FlexRow halign="center" valign="center">
			<Button disabled={disabled} onClick={onClick}>
				<StyledIcon type={disabled ? "locked" : "unlocked"} iconColor="hvit" />
			</Button>
		</FlexRow>
	);
};

const StyledIcon = styled(Icon)`
	width: ${rem(20)};
	height: ${rem(20)};
`;

const Button = styled.button<{ disabled: boolean }>`
	background-color: transparent;
	border: none;
	cursor: ${(props) => (props.disabled ? "default" : "pointer")};
	border-radius: ${borderRadius.large};
	display: flex;
	justify-content: center;
	align-items: center;
	width: ${rem(40)};
	height: ${rem(40)};
	padding: 0;
	:hover {
		${(props) =>
			!props.disabled &&
			css`
				background-color: rgba(255, 255, 255, 0.1);
			`}
	}
`;
