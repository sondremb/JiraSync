import { IsoDate } from "../date-time/IsoWeek";
import { groupBy, unique } from "../Utils/arrayUtils";
import { LoadJiraWorklogs, LoadPolicy, LoadBekkEntries } from "./contracts";
import {
	DayReport,
	BekkEntry,
	JiraWorklog,
	BekkTimecodeId,
	ManagedTimecodeDayComparison,
	JiraMatchResult,
} from "./entities";

export async function reconcilePeriod(
	from: IsoDate,
	to: IsoDate,
	loadJiraWorklogs: LoadJiraWorklogs,
	loadPolicy: LoadPolicy,
	loadBekkEntries: LoadBekkEntries,
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

	const bekkEntries = await loadBekkEntries(from, to);

	const matchedTimecodeIds = [...matchResultByIssueId.values()]
		.filter((match) => match.isMatched)
		.map((match) => match.timecodeId);
	const allRelevantTimecodes = unique([
		...bekkEntries.map((work) => work.timecodeId),
		...matchedTimecodeIds,
	]);
	const managedTimecodes = await policy.selectManaged(allRelevantTimecodes);
	if (matchedTimecodeIds.some((id) => !managedTimecodes.has(id))) {
		throw new Error(
			"Invariant failure: policy matched to a timecode it does not manage",
		);
	}

	return reconcileDays(
		from,
		to,
		bekkEntries,
		jiraWorkLogs,
		matchResultByIssueId,
		managedTimecodes,
	);
}

export function reconcileDays(
	from: IsoDate,
	to: IsoDate,
	bekkEntries: BekkEntry[],
	jiraWorklogs: JiraWorklog[],
	matchResultByIssueId: JiraMatchResult,
	managedTimecodeIds: Set<BekkTimecodeId>,
): DayReport[] {
	const bekkEntriesByDate = groupBy(bekkEntries, (work) => work.date);
	const jiraWorkByDate = groupBy(jiraWorklogs, (work) => work.date);

	const days = IsoDate.range(from, to);
	return days.map((day) =>
		createDayReport(
			day,
			bekkEntriesByDate.get(day) ?? [],
			jiraWorkByDate.get(day) ?? [],
			matchResultByIssueId,
			managedTimecodeIds,
		),
	);
}

function createDayReport(
	date: IsoDate,
	bekkEntries: BekkEntry[],
	jiraWork: JiraWorklog[],
	matchResultByIssueId: JiraMatchResult,
	managedTimecodeIds: Set<BekkTimecodeId>,
): DayReport {
	const report = DayReport.empty(date);

	bekkEntries.forEach((work) => {
		if (!managedTimecodeIds.has(work.timecodeId)) {
			report.unmanagedEntries.push(work);
			return;
		}
		const comparison = getOrCreateComparison(report, work.timecodeId);
		comparison.bekkHours += work.hoursWorked;
	});

	jiraWork.forEach((work) => {
		// invariant: all issues in worklog have a match result
		const matchResult = matchResultByIssueId.get(work.issueId)!;
		if (!matchResult.isMatched) {
			report.unmatchedJiraWorklogs.push(work);
			return;
		}
		// invariant: a Policy can only match to Bekk Timecodes that are Managed
		const comparison = getOrCreateComparison(report, matchResult.timecodeId);
		comparison.matchedWorklogs.push(work);
	});

	return report;
}

function getOrCreateComparison(report: DayReport, timecodeId: BekkTimecodeId) {
	let comparison = report.comparisons.get(timecodeId);
	if (comparison === undefined) {
		comparison = ManagedTimecodeDayComparison.empty(timecodeId);
		report.comparisons.set(timecodeId, comparison);
	}
	return comparison;
}
