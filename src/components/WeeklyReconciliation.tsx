import React from "react";
import {
	DayReport,
	ManagedTimecodeDayComparison,
} from "../reconciliation/entities";
import { useWeeklyReconciliation } from "../reconciliation/useWeeklyReconciliation";
import { IsoWeek } from "../date-time/IsoWeek";
import { Ruleset } from "../rules";

interface Props {
	week: IsoWeek;
	ruleset: Ruleset;
}

export const WeeklyReconciliation: React.FC<Props> = ({ week, ruleset }) => {
	const { data, error, isPending } = useWeeklyReconciliation(week, ruleset);
	return (
		<section aria-label="Avstemming" className="mt-20">
			<h2>Avstemming (lesevisning)</h2>
			{isPending ? (
				<p>Henter timer fra Jira og internt system…</p>
			) : error ? (
				<p role="alert">Kunne ikke avstemme uken: {error.message}</p>
			) : (
				data?.map((report) => <DayComparison key={report.date} report={report} />)
			)}
		</section>
	);
};

function DayComparison({ report }: { report: DayReport }) {
	return (
		<section>
			<h3>
				{report.date} — {DayReport.isInSync(report) ? "Stemmer" : "Trenger gjennomgang"}
			</h3>
			{report.comparisons.size > 0 && (
				<table>
					<thead>
						<tr>
							<th scope="col">Timekode</th>
							<th scope="col">Internt</th>
							<th scope="col">Jira</th>
							<th scope="col">Status</th>
						</tr>
					</thead>
					<tbody>
						{Array.from(report.comparisons.values(), (comparison) => (
							<tr key={comparison.timecodeId}>
								<th scope="row">{comparison.timecodeId}</th>
								<td>{comparison.internalHoursWorked}</td>
								<td>{ManagedTimecodeDayComparison.jiraHoursWorked(comparison)}</td>
								<td>{ManagedTimecodeDayComparison.isInSync(comparison) ? "Stemmer" : "Avvik"}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			{report.unmatchedJiraWork.length > 0 && (
				<p>
					Uten regel i Jira: {report.unmatchedJiraWork.map((work) => `${work.issueId} (${work.hoursWorked} t)`).join(", ")}
				</p>
			)}
			{report.unmanagedInternals.length > 0 && (
				<p>
					Utenfor valgt policy (internt): {report.unmanagedInternals.map((work) => `${work.timecodeId} (${work.hoursWorked} t)`).join(", ")}
				</p>
			)}
		</section>
	);
}
