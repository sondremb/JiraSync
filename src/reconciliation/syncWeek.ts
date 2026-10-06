import type { ProposedChange } from "./syncPreview";

export async function syncWeek(
	changes: readonly ProposedChange[],
	write: (change: ProposedChange) => Promise<void>,
): Promise<void> {
	let completed = 0;
	for (const change of changes) {
		try {
			await write(change);
			completed++;
		} catch (error) {
			throw new Error(
				`Updated ${completed} of ${changes.length} entries. Failed on ${change.date} / ${change.timecodeId}: ${error instanceof Error ? error.message : String(error)}`,
				{ cause: error },
			);
		}
	}
}
