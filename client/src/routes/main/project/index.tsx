import type { Project } from "@tsa/shared";
import {
	ArrowLeft,
	ArrowUpRight,
	Calendar,
	ExternalLink,
	Users,
} from "lucide-react";
import { Link, useParams } from "react-router";
import ProjectCard from "@/components/features/project-card";
import CtaCard from "@/components/features/cta-card";
import { Seo } from "@/components/provider/seo";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import NotFound from "@/components/ui/not-found";
import QueryError from "@/components/ui/query-error";
import { useProject } from "@/hooks/use-project";
import {
	getBlurPlaceholderUrl,
	getOptimizedImageUrl,
	initials,
} from "@/lib/utils";

export default function ProjectDetail() {
	const { projectId } = useParams<{ slug: string; projectId: string }>();
	const { data, isLoading, isError, refetch } = useProject(projectId);
	const project = data?.project;
	const recommended = data?.recommended || [];

	if (isLoading) return <ProjectSkeleton />;

	if (isError) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
				<QueryError
					message="Couldn't load this project. Please try again."
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	if (!project) {
		return <NotFound />;
	}

	const cover = getOptimizedImageUrl(project.coverImageUrl, 1280, 720);
	const memberCount = project.teamMembers.length;
	const links = project.links ?? {};
	const hasLinks = Boolean(links.url || links.github || links.figma);

	return (
		<>
			{/* Dynamic SEO — overrides the route's static handle.seo with real data. */}
			<Seo
				title={project.title}
				description={project.summary ?? project.description.slice(0, 155)}
				image={project.coverImageUrl}
			/>

			<article className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
				<Link
					to="/explore"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
				>
					<ArrowLeft className="size-4" /> Back to explore
				</Link>

				{/* Title + meta */}
				<header className="mt-6 space-y-3">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						{project.title}
					</h1>

					<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
						<span>{project.category}</span>
						<span aria-hidden className="text-muted-foreground/40">
							·
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="size-4" /> {project.cohort}
							{project.year ? ` · ${project.year}` : ""}
						</span>
						<span aria-hidden className="text-muted-foreground/40">
							·
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Users className="size-4" /> {memberCount} member
							{memberCount === 1 ? "" : "s"}
						</span>
					</div>
				</header>

				{/* Cover image */}
				{cover && (
					<BlurImage
						src={cover}
						alt={project.title}
						blurSrc={getBlurPlaceholderUrl(cover)}
						eager
						className="mt-8 aspect-video w-full rounded-2xl border border-border"
					/>
				)}

			{/* Description */}
			{project.description && (
				<AnimateOnScroll>
					<p className="mt-8 whitespace-pre-line text-xl leading-[38.4px] text-lightGray">
						{project.description}
					</p>
				</AnimateOnScroll>
			)}

			{/* Gallery (optional) */}
			{project.media && project.media.length > 0 && (
				<AnimateOnScroll>
					<section className="mt-12">
						<h2 className="text-xl font-semibold">Gallery</h2>
						<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
							{project.media.map((m, i) => (
								<BlurImage
									key={`${m.publicId}-${i}`}
									src={getOptimizedImageUrl(m.mediaUrl, 800, 500)}
									alt={`${project.title} screenshot ${i + 1}`}
									blurSrc={getBlurPlaceholderUrl(m.mediaUrl)}
									className="aspect-video w-full rounded-xl border border-border"
								/>
							))}
						</div>
					</section>
				</AnimateOnScroll>
			)}

			{/* Team members */}
			{memberCount > 0 && (
				<AnimateOnScroll>
					<section className="mt-12">
						<h2 className="text-xl font-semibold">Team members</h2>
						<ul className="mt-5 flex flex-wrap gap-8">
							{project.teamMembers.map((m, i) => (
								<li
									key={`${m.name}-${i}`}
									className="flex w-24 flex-col items-center gap-2 text-center"
								>
									<Avatar className="size-20">
										{m.avatarUrl && (
											<AvatarImage
												src={getOptimizedImageUrl(m.avatarUrl, 160)}
												alt={m.name}
											/>
										)}
										<AvatarFallback className="text-lg font-semibold">
											{initials(m.name)}
										</AvatarFallback>
									</Avatar>
									<span className="text-sm font-medium">{m.name}</span>
									{m.role && (
										<span className="text-xs text-muted-foreground">
											{m.role}
										</span>
									)}
								</li>
							))}
						</ul>
					</section>
				</AnimateOnScroll>
			)}

			{/* Project links */}
			{hasLinks && (
				<AnimateOnScroll>
					<section className="mt-12">
						<h2 className="text-xl font-semibold">Project links</h2>
						<div className="mt-4 flex flex-wrap gap-3">
							{links.url && (
								<Button
									size="lg"
									nativeButton={false}
									className="h-10 px-5 text-sm"
									render={
										<a href={links.url} target="_blank" rel="noreferrer" />
									}
								>
									<ExternalLink /> Live site
								</Button>
							)}
							{links.github && (
								<Button
									variant="outline"
									size="lg"
									nativeButton={false}
									className="h-10 px-5 text-sm"
									render={
										<a href={links.github} target="_blank" rel="noreferrer" />
									}
								>
									<ExternalLink /> GitHub
								</Button>
							)}
							{links.figma && (
								<Button
									variant="outline"
									size="lg"
									nativeButton={false}
									className="h-10 px-5 text-sm"
									render={
										<a href={links.figma} target="_blank" rel="noreferrer" />
									}
								>
									<ExternalLink /> Figma
								</Button>
							)}
						</div>
					</section>
				</AnimateOnScroll>
			)}
			{recommended.length > 0 && (
				<AnimateOnScroll>
					<section className="mt-12">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-semibold">More projects</h2>
							<Link to="/explore">
								<Button variant="link" className="text-mainBlue">
									View all
									<ArrowUpRight />
								</Button>
							</Link>
						</div>
						<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{recommended.map((project: Project, index: number) => (
								<AnimateOnScroll key={project._id} delay={index * 60}>
									<ProjectCard project={project} />
								</AnimateOnScroll>
							))}
						</div>
					</section>
				</AnimateOnScroll>
			)}
			<div className="mt-20">
				<AnimateOnScroll>
					<CtaCard />
				</AnimateOnScroll>
			</div>
			</article>
		</>
	);
}

/** Lightweight loading placeholder that mirrors the page layout. */
function ProjectSkeleton() {
	return (
		<div className="mx-auto max-w-7xl animate-pulse px-4 pt-25 sm:px-6 lg:px-8">
			<div className="h-4 w-24 rounded bg-muted" />
			<div className="mt-6 h-9 w-2/3 rounded bg-muted" />
			<div className="mt-3 h-4 w-1/2 rounded bg-muted" />
			<div className="mt-8 aspect-video w-full rounded-2xl bg-muted" />
			<div className="mt-8 space-y-3">
				<div className="h-4 w-full rounded bg-muted" />
				<div className="h-4 w-11/12 rounded bg-muted" />
				<div className="h-4 w-10/12 rounded bg-muted" />
			</div>
		</div>
	);
}
