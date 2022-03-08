import { Icon, IconType, spacing, Text } from "@udir/lisa";
import React from "react";
import styled from "styled-components";

interface Props {
	onClick?: (event: React.MouseEvent) => void;
	icon?: JSX.Element | IconType;
	/** Default er "left" hvis et ikon er satt */
	iconPlacement?: "left" | "right";
	pending?: boolean;
	disabled?: boolean;
	id?: string;
	type?: "submit" | "reset" | "button";
}

const StyledButton = styled.button`
	margin: 0;
	padding: 0;
	border: none;
	background-color: inherit;
	display: flex;
	align-items: center;
	cursor: pointer;
`;

export const StyledIconContainer = styled.span<Pick<Props, "iconPlacement">>`
	display: flex;
	align-items: center;
	${(props) =>
		props.iconPlacement === "right"
			? `margin-left: ${spacing(8)};`
			: `margin-right: ${spacing(8)};`}
	margin-bottom: 1px;
`;

export const TextButton: React.FC<Props> = (props) => {
	let content = props.children;
	if (props.icon && props.iconPlacement) {
		const iconContainer = (
			<StyledIconContainer iconPlacement={props.iconPlacement}>
				{typeof props.icon === "string" ? (
					<Icon type={props.icon} />
				) : (
					props.icon
				)}
			</StyledIconContainer>
		);
		content = (
			<>
				{props.iconPlacement === "left" && iconContainer}
				{content}
				{props.iconPlacement === "right" && iconContainer}
			</>
		);
	}
	return (
		<Text textStyle="Brødtekst uthevet" as={StyledButton} {...props}>
			{content}
		</Text>
	);
};

TextButton.defaultProps = {
	iconPlacement: "left",
};
