import { colors, ColorType, Icon, IconType, spacing, Text } from "@udir/lisa";
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
	// TODO skulle gjerne importert ColorTheme fra Lisa
	colorTheme?: "dark" | "light";
}

const StyledButton = styled.button<{ isDarkTheme: boolean }>`
	margin: 0;
	padding: ${spacing(4)} ${spacing(12)};
	border: none;
	background-color: inherit;
	display: flex;
	align-items: center;
	cursor: pointer;
	border-radius: 3px;
	border: 1px solid transparent;
	transition: transform 0.1s ease-out;

	&:hover {
		border-color: ${(props) =>
			props.isDarkTheme
				? colors.støttefarge.grå98.hex
				: colors.støttefarge.svart10.hex};
		transform: translateY(-0.1rem);
		box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
	}
	&:active {
		border-color: ${(props) =>
			props.isDarkTheme
				? colors.støttefarge.grå98.hex
				: colors.støttefarge.svart10.hex};
		transform: translateY(0.2rem);
		box-shadow: 0 0.2rem 0.3rem rgba(0, 0, 0, 0.1);
	}
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
	const isDarkTheme = props.colorTheme === "dark";
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
		<Text
			textStyle="Brødtekst uthevet"
			as={StyledButton}
			getColor={(c: ColorType) =>
				isDarkTheme ? c.støttefarge.grå98 : c.støttefarge.svart19
			}
			isDarkTheme={isDarkTheme}
			{...props}
		>
			{content}
		</Text>
	);
};

TextButton.defaultProps = {
	iconPlacement: "left",
	colorTheme: "light",
};
