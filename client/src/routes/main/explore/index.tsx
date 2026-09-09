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
import { ProjectShowcaseSkeleton } from "../home/project-showcase";

type Category = (typeof CATEGORIES)[number];

export default function Explore() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Math.max(1, Number(searchParams.get("page")) || 1);

	const categoryParam = searchParams.get("category");
	const category: Category =
		categoryParam && (CATEGORIES as readonly string[]).includes(categoryParam)
			? (categoryParam as Category)
			: "All";

	const sortParam = searchParams.get("sort");
	const sort: SortOrder = sortParam === "Oldest" ? "Oldest" : "Most Recent";

	const { data, isLoading, isError } = useProjects(
		{
			page,
			category,
			sort,
			limit: 10,
		},
		{ refetchOnWindowFocus: false },
	);

	const projects = data?.items ?? [];
  const { page: currentPage, totalPages } = data ?? {};
	
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
		<div className="mx-auto max-w-7xl pb-20 px-4 pt-25 sm:px-6 lg:px-25">
			<h2 className="text-3xl font-bold  tracking-[-5%] uppercase sm:text-4xl">
				Explore Projects
			</h2>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by course">
						<span className="text-[14px] font-medium text-muted-foreground">
							Courses:
						</span>
						{CATEGORIES.map((item) => (
							<Button
								key={item}
								type="button"
								aria-pressed={category === item}
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
			{isLoading ? (
				<ProjectShowcaseSkeleton />
			) : isError || projects.length === 0 ? (
				<NotFound />
			) : (
				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{projects.map((project: Project) => (
						<ProjectCard project={project} key={project._id} />
					))}
				</div>
			)}
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
	);
}
