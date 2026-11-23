/**
 * PROTOTYPE, throw away. Floating bar that cycles `?variant=` on the current
 * route. Dev builds only. Top-centre, over the empty middle of the app bar,
 * so it does not cover variant B's sticky action bar.
 */
import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
	variants: { key: string; name: string }[];
	current: string;
}

export const PrototypeSwitcher: React.FC<Props> = ({ variants, current }) => {
	const navigate = useNavigate();
	const index = Math.max(
		0,
		variants.findIndex((v) => v.key === current),
	);
	const go = (delta: number) => {
		const next = variants[(index + delta + variants.length) % variants.length];
		void navigate({
			to: ".",
			search: (prev: Record<string, unknown>) => ({
				...prev,
				variant: next.key,
			}),
			replace: true,
		} as never);
	};

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (
				target?.closest(
					"input, textarea, select, [contenteditable], dialog[open]",
				)
			)
				return;
			if (event.key === "ArrowLeft") go(-1);
			if (event.key === "ArrowRight") go(1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	if (!import.meta.env.DEV) return null;
	const v = variants[index];
	return (
		<div
			style={{
				position: "fixed",
				left: "50%",
				top: 12,
				transform: "translateX(-50%)",
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "6px 8px",
				borderRadius: 999,
				background: "#111",
				color: "#fff",
				font: "500 13px/1 system-ui, sans-serif",
				boxShadow: "0 6px 20px rgb(0 0 0 / 0.35)",
			}}
		>
			<SwitchButton label="Forrige variant" onClick={() => go(-1)}>
				←
			</SwitchButton>
			<span style={{ minWidth: 160, textAlign: "center" }}>
				{v.key} ({v.name})
			</span>
			<SwitchButton label="Neste variant" onClick={() => go(1)}>
				→
			</SwitchButton>
		</div>
	);
};

const SwitchButton: React.FC<
	React.PropsWithChildren<{ label: string; onClick: () => void }>
> = ({ label, onClick, children }) => (
	<button
		type="button"
		aria-label={label}
		onClick={onClick}
		style={{
			width: 28,
			height: 28,
			border: "none",
			borderRadius: 999,
			background: "#333",
			color: "#fff",
			cursor: "pointer",
		}}
	>
		{children}
	</button>
);
