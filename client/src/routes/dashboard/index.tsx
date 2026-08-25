import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { useRecentProjects } from "@/hooks/use-project";
import { STATUS_STYLES } from "@/lib/constants";
import RenderTable from "./render-table";

export default function Dashboard() {
	const { data, isLoading, isError } = useRecentProjects();
	const stats = data?.stats;
	const items = data?.items ?? [];

	const statCards = [
		{ label: "Total projects", value: stats?.totalProjects },
		{ label: "Published", value: stats?.publishedProjects },
		{ label: "Drafts", value: stats?.draftProjects },
	];

	return (
		<div className="container mx-auto">
			<div className="space-y-2">
				<h1 className="font-semibold text-[26px] text-mainBlack">
					Welcome back Admin 👋🏼
				</h1>
				<p className="text-lg text-mainGray">
					Here's what's happening with your portfolio projects today
				</p>
			</div>

			{isLoading && <DashboardSkeleton />}

			{isError && (
				<p className="mt-8 text-mainGray">
					Couldn't load your dashboard. Please try again later.
				</p>
			)}

			{stats && (
				<section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{statCards.map((card) => (
						<div
							key={card.label}
							className="rounded-xl border border-border p-6"
						>
							<div className="flex justify-between items-center">
								<p className="text-sm text-mainGray">{card.label}</p>
								<img src="/Frame28.svg" alt="stats" />
							</div>
							<p className="mt-2 text-3xl font-semibold text-mainBlack">
								{card.value ?? 0}
							</p>
						</div>
					))}
				</section>
			)}

			{items.length > 0 && (
				<section className="mt-10">
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-semibold text-mainBlack">
							Recently added
						</h2>
						<Link
							to="/dashboard/portfolio"
							className="flex items-center gap-1 text-mainBlue text-sm hover:underline"
						>
							View All
							<ArrowUpRight size={18} />
						</Link>
					</div>
					<RenderTable data={items} STATUS_STYLE={STATUS_STYLES} />
				</section>
			)}
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="mt-8 animate-pulse space-y-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-24 rounded-xl bg-muted" />
				))}
			</div>
			<div className="h-64 rounded-xl bg-muted" />
		</div>
	);
}
