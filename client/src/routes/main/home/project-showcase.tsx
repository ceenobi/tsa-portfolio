import type { Project } from "@tsa/shared";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import ProjectCard from "@/components/features/project-card";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/not-found";
import { useProjects } from "@/hooks/use-project";

export default function ProjectShowcase() {
	const { data, isLoading, isError } = useProjects(
		{ limit: 6 },
		{ refetchOnWindowFocus: false },
	);

	const projects = data?.items ?? [];

	return (
		<section className="bg-[#D0D0D0]/10">
			<div className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-25">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-[-5%] uppercase sm:text-4xl">
						Project Showcase
					</h2>
					<Link to="/explore">
						<Button variant="link" className="text-mainBlue">
							View all
							<ArrowUpRight />
						</Button>
					</Link>
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
			</div>
		</section>
	);
}

/** Loading placeholder that mirrors the showcase layout and card grid. */
export function ProjectShowcaseSkeleton() {
	return (
		<section className="bg-[#D0D0D0]/10">
			<div className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-25">
				<div className="h-9 w-56 animate-pulse rounded bg-muted sm:h-10" />

				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="aspect-[8/5] w-full rounded-[30px] bg-muted" />
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
