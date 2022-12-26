import { Text } from "@udir/lisa";
import { Moment } from "moment";
import React, { useEffect, useState } from "react";

interface Props {
	timestamp: Moment;
}

export const DownloadTimestamp: React.FC<Props> = (props) => {
	const [timeSince, setTimeSince] = useState(props.timestamp.fromNow());

	useEffect(() => {
		setTimeSince(props.timestamp.fromNow());
		const interval = setInterval(() => {
			setTimeSince(props.timestamp.fromNow());
		}, 1000);

		return function cleanup() {
			clearInterval(interval);
		};
	}, [props.timestamp]);

	return (
		<div>
			<Text>Sist lasted ned: {timeSince}</Text>
			<Text textStyle="label">
				{props.timestamp.format("Do Mo YY")} kl.{" "}
				{props.timestamp.format("HH:mm:ss")}
			</Text>
		</div>
	);
};
