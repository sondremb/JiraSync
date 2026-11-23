import React from "react";
import { Paragraph } from "@digdir/designsystemet-react";
import { SyncActions } from "./StatusCard";
import { formatChangeCount } from "./syncMessages";
import type { SyncState } from "./syncState";
import styles from "./StickySyncBar.module.css";

interface Props {
	sync: SyncState;
	onSync: () => void;
	onPreview: () => void;
}

/**
 * The sync actions, pinned to the bottom of the viewport. Only for when the
 * status card, which has the same buttons, is scrolled away. Shows nothing
 * unless there are changes.
 */
export const StickySyncBar: React.FC<Props> = ({ sync, onSync, onPreview }) =>
	sync.kind === "changes" ? (
		<div className={styles.stickySyncBar}>
			<Paragraph className={styles.stickySyncBar__text}>
				<strong>{formatChangeCount(sync.count)}</strong> klare til Timekeeper
			</Paragraph>
			<div className={styles.stickySyncBar__buttons}>
				<SyncActions sync={sync} onSync={onSync} onPreview={onPreview} />
			</div>
		</div>
	) : null;
