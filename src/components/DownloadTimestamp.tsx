import { Text } from "@udir/lisa";
import { format, formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale/nb";
import React, { useEffect, useState } from "react";

interface Props {
	timestamp: Date;
}

export const DownloadTimestamp: React.FC<Props> = (props) => {
	const [timeSince, setTimeSince] = useState(
		formatDistanceToNow(props.timestamp, { locale: nb })
	);

	useEffect(() => {
		setTimeSince(formatDistanceToNow(props.timestamp, { locale: nb }));
		const interval = setInterval(() => {
			setTimeSince(formatDistanceToNow(props.timestamp, { locale: nb }));
		}, 1000);

		return function cleanup() {
			clearInterval(interval);
		};
	}, [props.timestamp]);

	return (
		<div>
			<Text>Sist lastet ned: {timeSince} siden</Text>
			<Text textStyle="label">
				{format(props.timestamp, "do MMM yy 'kl' HH:mm:ss", { locale: nb })}
			</Text>
		</div>
	);
};
