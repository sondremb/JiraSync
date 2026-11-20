import { Dropdown } from "@digdir/designsystemet-react";
import {
	LeaveIcon,
	MenuHamburgerIcon,
	TasklistIcon,
} from "@navikt/aksel-icons";
import React, { useState } from "react";
import { RulesetDialog } from "../components/RulesetModal";
import { useBekkAccount } from "../login/bekk/useBekkAccount";
import { useLogout } from "../login/useLogout";

/**
 * Compact stand-in for `UserStatus` and the "Velg regler" button on narrow
 * screens. Both change rarely, so they sit behind one button.
 */
export const UserMenu: React.FC<{ className?: string }> = ({ className }) => {
	const { name } = useBekkAccount();
	const logout = useLogout();
	const [menuOpen, setMenuOpen] = useState(false);
	const [rulesetOpen, setRulesetOpen] = useState(false);

	return (
		<div className={className}>
			<Dropdown.TriggerContext>
				<Dropdown.Trigger
					variant="tertiary"
					icon
					aria-label="Meny"
					title="Meny"
				>
					<MenuHamburgerIcon aria-hidden />
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
			<RulesetDialog open={rulesetOpen} onClose={() => setRulesetOpen(false)} />
		</div>
	);
};
