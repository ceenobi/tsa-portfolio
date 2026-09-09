import type { Project } from "@tsa/shared";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import ProjectCard from "@/components/features/project-card";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/not-found";
import QueryError from "@/components/ui/query-error";
import { useFeaturedProjects } from "@/hooks/use-project";

export default function ProjectShowcase() {
	const { data, isLoading, isError, refetch } = useFeaturedProjects();

	const projects = data ?? [];

	return (
		<section className="bg-muted/50">
			<div className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<AnimateOnScroll>
						<h2 className="text-3xl font-bold tracking-[-5%] uppercase sm:text-4xl">
							Project Showcase
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<Link to="/explore">
							<Button variant="link" className="text-mainBlue">
								View all
								<ArrowUpRight />
							</Button>
						</Link>
					</AnimateOnScroll>
				</div>
				{isLoading ? (
					<ProjectShowcaseSkeleton />
				) : isError ? (
					<QueryError
						message="Couldn't load projects. Please try again."
						onRetry={() => refetch()}
					/>
				) : projects.length === 0 ? (
					<NotFound />
				) : (
					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((project: Project, index: number) => (
							<AnimateOnScroll key={project._id} delay={index * 60}>
								<ProjectCard project={project} />
							</AnimateOnScroll>
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
		<div
			role="status"
			aria-label="Loading projects"
			className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-8"
		>
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
	);
}
