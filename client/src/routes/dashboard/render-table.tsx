import type { Project } from "@tsa/shared";

interface RenderTableProps {
	data: Project[];
	STATUS_STYLE: Record<string, string>;
}

const formatDate = (value?: string) =>
	value
		? new Date(value).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "—";

export default function RenderTable({ data, STATUS_STYLE }: RenderTableProps) {
	return (
		<div className="mt-4">
			{/* Table — tablet/desktop */}
			<div className="hidden overflow-x-auto rounded-xl border border-border md:block">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-border bg-muted/50">
							{[
								"Project",
								"Department",
								"Cohort",
								"Year",
								"Students",
								"Status",
								"Date Added",
							].map((header) => (
								<th
									key={header}
									className="px-5 py-3 font-medium whitespace-nowrap text-mainGray"
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{data.map((project) => (
							<tr key={project._id} className="hover:bg-muted/30">
								<td className="px-5 py-4 font-medium text-mainBlack">
									{project.title}
								</td>
								<td className="px-5 py-4 text-mainGray">{project.category}</td>
								<td className="px-5 py-4 text-mainGray">{project.cohort}</td>
								<td className="px-5 py-4 text-mainGray">
									{project.year ?? "—"}
								</td>
								<td className="px-5 py-4 text-mainGray">
									{project.teamMembers.length}
								</td>
								<td className="px-5 py-4">
									<StatusBadge
										status={project.status}
										styles={STATUS_STYLE[project.status]}
									/>
								</td>
								<td className="px-5 py-4 whitespace-nowrap text-mainGray">
									{formatDate(project.createdAt)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Cards — mobile */}
			<ul className="space-y-3 md:hidden">
				{data.map((project) => (
					<li
						key={project._id}
						className="rounded-xl border border-border p-4"
					>
						<div className="flex items-start justify-between gap-3">
							<p className="font-medium text-mainBlack">{project.title}</p>
							<StatusBadge
								status={project.status}
								styles={STATUS_STYLE[project.status]}
							/>
						</div>
						<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
							<MobileField label="Department" value={project.category} />
							<MobileField label="Cohort" value={project.cohort} />
							<MobileField label="Year" value={project.year ?? "—"} />
							<MobileField
								label="Students"
								value={String(project.teamMembers.length)}
							/>
							<div className="col-span-2">
								<dt className="text-xs text-mainGray">Date Added</dt>
								<dd className="text-mainBlack">{formatDate(project.createdAt)}</dd>
							</div>
						</dl>
					</li>
				))}
			</ul>
		</div>
	);
}

function StatusBadge({ status, styles }: { status: string; styles?: string }) {
	return (
		<span
			className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
				styles ?? "bg-muted text-mainGray"
			}`}
		>
			{status}
		</span>
	);
}

function MobileField({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs text-mainGray">{label}</dt>
			<dd className="text-mainBlack">{value}</dd>
		</div>
	);
}
