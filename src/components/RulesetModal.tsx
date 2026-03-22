import { Button, Modal } from "@utdanningsdirektoratet/lisa";
import React, { useState } from "react";
import { RulesetSelector } from "./RulesetSelector";

export const RulesetModal: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setIsModalOpen(true)} variant="outlined">
				Velg regler
			</Button>
			<Modal
				showModal={isModalOpen}
				title="Velg regler"
				onCancel={() => setIsModalOpen(false)}
			>
				<RulesetSelector className="mt-20" />
			</Modal>
		</>
	);
};
