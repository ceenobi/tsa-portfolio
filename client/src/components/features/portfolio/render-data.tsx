import { Menu } from "@base-ui/react/menu";
import type { Project } from "@tsa/shared";
import { EllipsisVertical, Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import type { ProjectsPage } from "@/lib/constants";

interface RenderDataProps {
	data: ProjectsPage;
	STATUS_STYLE: Record<string, string>;
	onView?: (project: Project) => void;
	onEdit?: (project: Project) => void;
	onDelete?: (project: Project) => void;
}

const HEADERS = [
	"Project",
	"Department",
	"Cohort",
	"Year",
	"Students",
	"Status",
	"Date Added",
	"",
];

const formatDate = (value?: string) =>
	value
		? new Date(value).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "—";

export default function RenderData({
	data,
	STATUS_STYLE,
	onView,
	onEdit,
	onDelete,
}: RenderDataProps) {
	return (
		<div className="mt-4">
			{/* Table — tablet/desktop */}
			<div className="hidden overflow-x-auto rounded-xl border border-border md:block">
				<table className="w-full text-left text-sm">
					<caption className="sr-only">
						Portfolio projects with status and actions
					</caption>
					<thead>
						<tr className="border-b border-border bg-muted/50">
							{HEADERS.map((header, i) => (
								<th
									key={`${header}-${i}`}
									scope="col"
									className="px-5 py-3 font-medium whitespace-nowrap text-mainGray"
								>
									{header === "" ? (
										<span className="sr-only">Actions</span>
									) : (
										header
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{data.items.map((project) => (
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
								<td className="px-5 py-4 text-right">
									<RowActions
										project={project}
										onView={onView}
										onEdit={onEdit}
										onDelete={onDelete}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Cards — mobile */}
			<ul className="space-y-3 md:hidden">
				{data.items.map((project) => (
					<li key={project._id} className="rounded-xl border border-border p-4">
						<div className="flex items-start justify-between gap-3">
							<p className="font-medium text-mainBlack">{project.title}</p>
							<RowActions
								project={project}
								onView={onView}
								onEdit={onEdit}
								onDelete={onDelete}
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
							<div className="col-span-2 flex items-center justify-between">
								<div>
									<dt className="text-xs text-mainGray">Status</dt>
									<dd>
										<StatusBadge
											status={project.status}
											styles={STATUS_STYLE[project.status]}
										/>
									</dd>
								</div>
								<div className="text-right">
									<dt className="text-xs text-mainGray">Date Added</dt>
									<dd className="text-mainBlack">
										{formatDate(project.createdAt)}
									</dd>
								</div>
							</div>
						</dl>
					</li>
				))}
			</ul>
		</div>
	);
}

function RowActions({
	project,
	onView,
	onEdit,
	onDelete,
}: {
	project: Project;
	onView?: (project: Project) => void;
	onEdit?: (project: Project) => void;
	onDelete?: (project: Project) => void;
}) {
	return (
		<Menu.Root>
			<Menu.Trigger
				render={
					<button
						type="button"
						aria-label={`Actions for ${project.title}`}
						className="relative rounded-md p-1.5 text-mainGray transition-colors before:absolute before:-inset-3 before:content-[''] hover:bg-muted hover:text-mainBlack"
					/>
				}
			>
				<EllipsisVertical className="size-4" />
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner align="end" sideOffset={6}>
					<Menu.Popup className="z-50 min-w-36 origin-(--transform-origin) rounded-lg bg-popover p-1 shadow-md ring-1 ring-foreground/10">
						<MenuItem
							icon={<Eye className="size-4" />}
							label="View"
							onClick={() => onView?.(project)}
						/>
						<MenuItem
							icon={<Pencil className="size-4" />}
							label="Edit"
							onClick={() => onEdit?.(project)}
						/>
						<MenuItem
							icon={<Trash2 className="size-4" />}
							label="Delete"
							destructive
							onClick={() => onDelete?.(project)}
						/>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}

function MenuItem({
	icon,
	label,
	onClick,
	destructive,
}: {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	destructive?: boolean;
}) {
	return (
		<Menu.Item
			onClick={onClick}
			className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted ${
				destructive
					? "text-red-600 data-[highlighted]:text-red-700"
					: "text-mainBlack"
			}`}
		>
			{icon}
			{label}
		</Menu.Item>
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
