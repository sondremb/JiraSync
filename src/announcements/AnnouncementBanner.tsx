import React, { useId, useState } from "react";
import { Alert, Button, Paragraph } from "@digdir/designsystemet-react";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@navikt/aksel-icons";
import { IsoDate } from "../date-time/IsoWeek";
import { getSafeStorage } from "../Utils/safeStorage";
import { announcements } from "./announcements";
import {
	loadSeenUpTo,
	newestDate,
	saveSeenUpTo,
	unseenAnnouncements,
} from "./unseen";
import styles from "./AnnouncementBanner.module.css";

/**
 * One dismissible banner listing every announcement this device hasn't seen.
 * With several, it starts collapsed to the newest and can expand to all of them.
 */
export const AnnouncementBanner: React.FC = () => {
	const [shown, setShown] = useState(() =>
		unseenAnnouncements(
			announcements,
			loadSeenUpTo(getSafeStorage()),
			IsoDate.fromDate(new Date()),
		),
	);
	const [expanded, setExpanded] = useState(false);
	const listId = useId();
	if (shown.length === 0) {
		return null;
	}

	const dismiss = () => {
		const newest = newestDate(shown);
		if (newest !== null) {
			saveSeenUpTo(getSafeStorage(), newest);
		}
		setShown([]);
	};

	const newest = shown[shown.length - 1];
	const others = shown.length - 1;

	return (
		<Alert
			data-color="info"
			data-size="sm"
			className={styles.announcementBanner}
		>
			<div className={styles.announcementBanner__content}>
				{expanded ? (
					<ul id={listId} className={styles.announcementBanner__list}>
						{shown.map((a) => (
							<li key={a.id}>{a.text}</li>
						))}
					</ul>
				) : (
					<Paragraph id={listId} className={styles.announcementBanner__text}>
						{newest.text}
					</Paragraph>
				)}
				{others > 0 && (
					<Button
						variant="tertiary"
						data-size="sm"
						aria-expanded={expanded}
						aria-controls={listId}
						onClick={() => setExpanded(!expanded)}
						className={styles.announcementBanner__toggle}
					>
						{expanded ? (
							<>
								<ChevronUpIcon aria-hidden />
								Vis færre
							</>
						) : (
							<>
								<ChevronDownIcon aria-hidden />
								{others === 1 ? "Vis 1 nyhet til" : `Vis ${others} nyheter til`}
							</>
						)}
					</Button>
				)}
			</div>
			<Button
				variant="tertiary"
				icon
				data-size="sm"
				aria-label="Lukk"
				title="Lukk"
				onClick={dismiss}
				className={styles.announcementBanner__close}
			>
				<XMarkIcon aria-hidden />
			</Button>
		</Alert>
	);
};
