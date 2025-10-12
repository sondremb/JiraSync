import React from "react";
import { addDays } from "date-fns";
import { App } from "./App";
import { useLockDate } from "./data/useLockDate";
import { IsoWeek } from "./date-time/IsoWeek";
import { Loading } from "@utdanningsdirektoratet/lisa";
import styled from "styled-components";

export const LockdateWrapper: React.FC = () => {
	const { lockDate } = useLockDate();

	if (lockDate === undefined) {
		return (
			<LoadingContainer>
				<Loading pending size="extraLarge" />
			</LoadingContainer>
		);
	}
	const initialWeek = IsoWeek.fromDate(addDays(new Date(lockDate), 1));

	return <App initialWeek={initialWeek} />;
};

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
`;
