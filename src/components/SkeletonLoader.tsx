import { Text } from "@udir/lisa";
import { TextStyle, colors, borderRadius } from "@udir/lisa-tokens";
import React from "react";
import styled from "styled-components";

interface Props {
	textStyle?: TextStyle;
}

export const SkeletonLoader: React.FC<React.PropsWithChildren<Props>> = ({
	textStyle,
	children,
}) => {
	return (
		<StyledText as="span" textStyle={textStyle}>
			{children}
		</StyledText>
	);
};

const StyledText = styled(Text)`
	color: transparent;
	background-color: ${colors.grå400};
	border-radius: ${borderRadius.small};
`;
