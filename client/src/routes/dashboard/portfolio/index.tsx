import type { Project } from "@tsa/shared";
import { useNavigate, useSearchParams } from "react-router";
import AddProject from "@/components/features/add-project";
import Filter from "@/components/features/portfolio/filter";
import RenderData from "@/components/features/portfolio/render-data";
import PaginateBox from "@/components/ui/paginate-box";
import { useProjects } from "@/hooks/use-project";
import { CATEGORIES, STATUS_STYLES } from "@/lib/constants";

type Category = (typeof CATEGORIES)[number];

export default function Portfolio() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const page = Math.max(1, Number(searchParams.get("page")) || 1);
	const limit = 10;
	const query = searchParams.get("query") || "";
	const categoryParam = searchParams.get("category");
	const category: Category =
		categoryParam && (CATEGORIES as readonly string[]).includes(categoryParam)
			? (categoryParam as Category)
			: "All";

	const { data, isLoading, isError } = useProjects({
		page,
		limit,
		category,
		query,
	});

	// Filter option lists derived from everything loaded so far.
	const cohorts = [...new Set((data?.items ?? []).map((p) => p.cohort))];
	const years = [
		...new Set(
			(data?.items ?? [])
				.map((p) => p.year)
				.filter((y): y is string => Boolean(y)),
		),
	].sort();

	function goToPage(newPage: number) {
		const params = new URLSearchParams(searchParams);
		params.set("page", String(newPage));
		setSearchParams(params); // page is in the query key → TanStack refetches
	}

	return (
		<div className="container mx-auto space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="font-semibold text-[26px] text-mainBlack">Projects</h1>
				<AddProject />
			</div>
			<Filter cohorts={cohorts} years={years} />
			{isLoading && (
				<p className="mt-6 text-sm text-mainGray">Loading projects…</p>
			)}
			{isError && (
				<p className="mt-6 text-sm text-mainGray">
					Couldn't load projects. Please try again later.
				</p>
			)}
			{data && !isLoading && !isError && (
				<>
<RenderData
					data={data}
					STATUS_STYLE={STATUS_STYLES}
					onView={(project: Project) =>
						navigate(`/projects/${project.slug ?? "project"}/${project._id}`)
					}
					onEdit={(project: Project) =>
						navigate(`/dashboard/portfolio/edit/${project._id}`)
					}
					// onDelete={(project: Project) => { /* TODO */ }}
				/>
					{(data.items.length ?? 0) > 0 && (
						<div className="mt-6">
							<PaginateBox
								page={page}
								totalPages={data.totalPages}
								onPageChange={goToPage}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
