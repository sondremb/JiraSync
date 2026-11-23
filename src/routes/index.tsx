import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BekkEntraLogin } from "../login/bekk/bekkLogin";
import { LockdateWrapper } from "../LockdateWrapper";
import { requireAuth } from "../login/requireAuth";
// PROTOTYPE, throw away: front-page redesign variants, `?variant=A|B|C|D`.
import { PrototypeSwitcher } from "../components/PrototypeSwitcher";
import { VariantB } from "../components/FrontPagePrototype/VariantB";
import { VariantC } from "../components/FrontPagePrototype/VariantC";
import { VariantD } from "../components/FrontPagePrototype/VariantD";

const VARIANTS = [
	{ key: "A", name: "Nåværende" },
	{ key: "B", name: "Statusrutenett" },
	{ key: "C", name: "Endringer først" },
	{ key: "D", name: "Kort + rutenett" },
];

export const Route = createFileRoute("/")({
	component: Component,
	beforeLoad: requireAuth,
	validateSearch: (search: Record<string, unknown>): { variant?: string } =>
		typeof search.variant === "string" ? { variant: search.variant } : {},
});

function Component() {
	const { variant: requested } = Route.useSearch();
	const variant = import.meta.env.DEV ? (requested ?? "A") : "A";
	return (
		<BekkEntraLogin>
			{variant === "B" ? (
				<VariantB />
			) : variant === "C" ? (
				<VariantC />
			) : variant === "D" ? (
				<VariantD />
			) : (
				<LockdateWrapper />
			)}
			{import.meta.env.DEV && (
				<PrototypeSwitcher variants={VARIANTS} current={variant} />
			)}
		</BekkEntraLogin>
	);
}
