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
 * when it is, a tinted panel when it isn't.
 */
export const MonthReviewLine: React.FC<Props> = ({ message, onShowWeek }) => {
	if (!message) return null;
	return (
		<p
			aria-live="polite"
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
							<Link key={part.week} asChild>
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
