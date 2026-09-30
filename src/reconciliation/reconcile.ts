import { IsoDate } from "../date-time/IsoWeek";
import { groupBy, unique } from "../Utils/arrayUtils";
import {
	LoadJiraWorklogs,
	LoadPolicy,
	LoadInternalWorklogs,
} from "./contracts";
import {
	DayReport,
	InternalWork,
	JiraWork,
	JiraIssueId,
	JiraMatchResult,
	InternalTimecodeId,
	ManagedTimecodeDayComparison,
} from "./entities";

export async function reconcilePeriod(
	from: IsoDate,
	to: IsoDate,
	loadJiraWorklogs: LoadJiraWorklogs,
	loadPolicy: LoadPolicy,
	loadInternalWorklogs: LoadInternalWorklogs,
): Promise<DayReport[]> {
	const policy = await loadPolicy();

	const jiraWorkLogs = await loadJiraWorklogs(from, to);
	const issueIds = unique(jiraWorkLogs.map((work) => work.issueId));
	const matchResultByIssueId = await policy.matchIssues(issueIds);
	if (jiraWorkLogs.some((work) => !matchResultByIssueId.has(work.issueId))) {
		throw new Error(
			"Invariant failure: policy did not provide match for all issues",
		);
	}

	const internalWork = await loadInternalWorklogs(from, to);
	const managedTimecodes = await policy.getManagedTimecodes();

	return reconcileInternal(
		from,
		to,
		internalWork,
		jiraWorkLogs,
		matchResultByIssueId,
		managedTimecodes,
	);
}

export function reconcileInternal(
	from: IsoDate,
	to: IsoDate,
	internalWorklogs: InternalWork[],
	jiraWorklogs: JiraWork[],
	matchResultByIssueId: Map<JiraIssueId, JiraMatchResult>,
	managedTimecodeIds: Set<InternalTimecodeId>,
): DayReport[] {
	const internalWorkByDate = groupBy(internalWorklogs, (work) => work.date);
	const jiraWorkByDate = groupBy(jiraWorklogs, (work) => work.date);

	const days = IsoDate.range(from, to);
	return days.map((day) =>
		createDayReport(
			day,
			internalWorkByDate.get(day) ?? [],
			jiraWorkByDate.get(day) ?? [],
			matchResultByIssueId,
			managedTimecodeIds,
		),
	);
}

function createDayReport(
	date: IsoDate,
	internalWork: InternalWork[],
	jiraWork: JiraWork[],
	matchResultByIssueId: Map<JiraIssueId, JiraMatchResult>,
	managedTimecodeIds: Set<InternalTimecodeId>,
): DayReport {
	const report = DayReport.empty(date);

	internalWork.forEach((work) => {
		if (!managedTimecodeIds.has(work.timecodeId)) {
			report.unmanagedInternals.push(work);
			return;
		}
		const comparison = getOrCreateComparison(report, work.timecodeId);
		comparison.internalHoursWorked += work.hoursWorked;
	});

	jiraWork.forEach((work) => {
		// invariant: all issues in worklog have a match result
		const matchResult = matchResultByIssueId.get(work.issueId)!;
		if (!matchResult.isMatched) {
			report.unmatchedJiraWork.push(work);
			return;
		}
		// invariant: a Policy can only match to Internal Timecodes that are Managed
		const comparison = getOrCreateComparison(report, matchResult.timecodeId);
		comparison.matchedWork.push(work);
	});

	return report;
}

function getOrCreateComparison(
	report: DayReport,
	timecodeId: InternalTimecodeId,
) {
	let comparison = report.comparisons.get(timecodeId);
	if (comparison === undefined) {
		comparison = ManagedTimecodeDayComparison.empty(timecodeId);
		report.comparisons.set(timecodeId, comparison);
	}
	return comparison;
}
