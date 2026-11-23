import React, { useState } from "react";
import {
	Avatar,
	Button,
	Dropdown,
	Heading,
	Tag,
} from "@digdir/designsystemet-react";
import { LeaveIcon, TasklistIcon } from "@navikt/aksel-icons";
import { RulesetDialog } from "../components/RulesetModal";
import { useRuleSet } from "../data/useRuleset";
import { useBekkAccount } from "../login/bekk/useBekkAccount";
import { useLogout } from "../login/useLogout";
import styles from "./AppBar.module.css";

const initials = (name: string | undefined) =>
	(name ?? "")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join("");

/**
 * Slim bar across the top: the app name, the selected ruleset (opens the
 * picker) and a user menu with the ruleset picker and logout.
 */
export const AppBar: React.FC = () => {
	const { name, photoUrl } = useBekkAccount();
	const [photoFailed, setPhotoFailed] = useState(false);
	const logout = useLogout();
	const { entries } = useRuleSet();
	const selected = entries.find((entry) => entry.isSelected);
	const [menuOpen, setMenuOpen] = useState(false);
	const [rulesetOpen, setRulesetOpen] = useState(false);

	return (
		<header className={styles.appBar}>
			<div className={styles.appBar__brand}>
				<Heading level={1} data-size="xs">
					Jirasync
				</Heading>
			</div>
			<div className={styles.appBar__actions}>
				{selected && (
					<Button
						variant="secondary"
						data-color="neutral"
						data-size="sm"
						className={styles.appBar__ruleset}
						aria-label={`Regler: ${selected.ruleset.name}. Velg regler`}
						title="Velg regler"
						onClick={() => setRulesetOpen(true)}
					>
						<TasklistIcon aria-hidden />
						<span className={styles.appBar__rulesetName}>
							{selected.ruleset.name}
						</span>
						{selected.kind !== "bundled" && (
							<Tag data-color="warning" data-size="sm">
								bare hos deg
							</Tag>
						)}
					</Button>
				)}
				<Dropdown.TriggerContext>
					<Dropdown.Trigger
						variant="tertiary"
						icon
						className={styles.appBar__user}
						aria-label="Meny"
						title={name}
					>
						<Avatar
							aria-hidden
							data-size="sm"
							className={styles.appBar__avatar}
						>
							{photoUrl && !photoFailed ? (
								<img
									src={photoUrl}
									alt=""
									onError={() => setPhotoFailed(true)}
								/>
							) : (
								initials(name) || undefined
							)}
						</Avatar>
					</Dropdown.Trigger>
					<Dropdown
						placement="bottom-end"
						open={menuOpen}
						onOpen={() => setMenuOpen(true)}
						onClose={() => setMenuOpen(false)}
					>
						{name && <Dropdown.Heading>{name}</Dropdown.Heading>}
						<Dropdown.List>
							<Dropdown.Item>
								<Dropdown.Button
									onClick={() => {
										setMenuOpen(false);
										setRulesetOpen(true);
									}}
								>
									<TasklistIcon aria-hidden />
									Velg regler
								</Dropdown.Button>
							</Dropdown.Item>
							<Dropdown.Item>
								<Dropdown.Button
									onClick={() => {
										setMenuOpen(false);
										void logout();
									}}
								>
									<LeaveIcon aria-hidden />
									Logg ut
								</Dropdown.Button>
							</Dropdown.Item>
						</Dropdown.List>
					</Dropdown>
				</Dropdown.TriggerContext>
			</div>
			<RulesetDialog open={rulesetOpen} onClose={() => setRulesetOpen(false)} />
		</header>
	);
};
