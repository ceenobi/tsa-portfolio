import type { Project } from "@tsa/shared";
import { useSearchParams } from "react-router";
import ProjectCard from "@/components/features/project-card";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/not-found";
import PaginateBox from "@/components/ui/paginate-box";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-project";
import { CATEGORIES, SORT_OPTIONS, type SortOrder } from "@/lib/constants";
import { cn, PAGE_SIZE } from "@/lib/utils";

type Category = (typeof CATEGORIES)[number];

export default function ProjectShowcase() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Math.max(1, Number(searchParams.get("page")) || 1);

	const categoryParam = searchParams.get("category");
	const category: Category =
		categoryParam && (CATEGORIES as readonly string[]).includes(categoryParam)
			? (categoryParam as Category)
			: "All";

	const sortParam = searchParams.get("sort");
	const sort: SortOrder = sortParam === "Oldest" ? "Oldest" : "Most Recent";

	const { data, isLoading, isError } = useProjects({ page, category, sort });
	console.log(data);
	if (isLoading) return <ProjectShowcaseSkeleton />;

	if (isError || !data || data.items.length === 0) {
		return <NotFound />;
	}

	const { items: projects, page: currentPage, totalPages } = data;

	const handlePageChange = (next: number) => {
		const params = new URLSearchParams(searchParams);
		if (next <= 1) params.delete("page");
		else params.set("page", String(next));
		setSearchParams(params);
	};

	const handleCategoryChange = (value: Category) => {
		const params = new URLSearchParams(searchParams);
		if (value === "All") params.delete("category");
		else params.set("category", value);
		params.delete("page");
		setSearchParams(params);
	};

	const handleSortChange = (value: SortOrder) => {
		const params = new URLSearchParams(searchParams);
		if (value === "Most Recent") params.delete("sort");
		else params.set("sort", value);
		params.delete("page");
		setSearchParams(params);
	};

	return (
		<section className="bg-[#D0D0D0]/10">
			<div className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-25">
				<h2 className="text-3xl font-bold  tracking-[-5%] uppercase sm:text-4xl">
					Project Showcase
				</h2>

				<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-[14px] font-medium text-muted-foreground">
							Courses:
						</span>
						{CATEGORIES.map((item) => (
							<Button
								key={item}
								type="button"
								variant={category === item ? "default" : "outline"}
								onClick={() => handleCategoryChange(item)}
								className={cn(
									"h-auto rounded-full px-3 py-1 text-sm",
									category === item
										? "border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90"
										: "text-muted-foreground",
								)}
							>
								{item}
							</Button>
						))}
					</div>

					<Select
						value={sort}
						onValueChange={(value) => handleSortChange(value as SortOrder)}
					>
						<SelectTrigger className="h-auto rounded-full bg-white px-3 py-1.5 text-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent
							align="start"
							alignItemWithTrigger={false}
							className="w-40"
						>
							{SORT_OPTIONS.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project: Project) => (
						<ProjectCard project={project} key={project._id} />
					))}
				</div>

				<div className="mt-8 flex flex-wrap items-center justify-between gap-4">
					<p className="text-sm text-muted-foreground">
						{PAGE_SIZE} Entries per page
					</p>
					<PaginateBox
						page={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
		</section>
	);
}

/** Loading placeholder that mirrors the showcase layout and card grid. */
function ProjectShowcaseSkeleton() {
	return (
		<section className="bg-[#D0D0D0]/10">
			<div className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-25">
				<div className="h-9 w-56 animate-pulse rounded bg-muted sm:h-10" />

				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="mx-auto h-62.5 w-100 max-w-full rounded-[30px] bg-muted" />
							<div className="space-y-2 p-4">
								<div className="h-4 w-1/3 rounded bg-muted" />
								<div className="h-4 w-1/2 rounded bg-muted" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
