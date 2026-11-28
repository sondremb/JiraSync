import React from "react";
import { Link } from "@digdir/designsystemet-react";
import type { IsoWeek } from "../date-time/IsoWeek";
import { StatusMark } from "./TimeTable/StatusMark";
import type { MonthReviewMessage } from "./monthReviewMessage";
import { classNames } from "../Utils/classNames";
import styles from "./MonthReviewLine.module.css";

interface Props {
	message: MonthReviewMessage | null;
	onShowWeek: (week: IsoWeek) => void;
}

/**
 * Whether the billing month is in sync, under the status card: a quiet line
 * when it is, a tinted panel when it isn't. The live region is always
 * rendered, so a screen reader announces the message when it arrives.
 */
export const MonthReviewLine: React.FC<Props> = ({ message, onShowWeek }) => {
	return (
		<div aria-live="polite" className={styles.liveRegion}>
			{message && <MessageLine message={message} onShowWeek={onShowWeek} />}
		</div>
	);
};

const MessageLine: React.FC<{
	message: MonthReviewMessage;
	onShowWeek: (week: IsoWeek) => void;
}> = ({ message, onShowWeek }) => {
	return (
		<p
			className={classNames(
				styles.monthReview,
				styles[`monthReview--${message.tone}`],
			)}
		>
			<StatusMark tone={message.tone} />
			<strong className={styles.monthReview__title}>{message.title}</strong>
			{message.parts.length > 0 && (
				<span>
					{message.parts.map((part, index) =>
						typeof part === "string" ? (
							<React.Fragment key={index}>{part}</React.Fragment>
						) : (
							<Link key={`${index}-${part.week}`} asChild>
								<button
									type="button"
									className={styles.monthReview__week}
									onClick={() => onShowWeek(part.week)}
								>
									{part.text}
								</button>
							</Link>
						),
					)}
				</span>
			)}
		</p>
	);
};
