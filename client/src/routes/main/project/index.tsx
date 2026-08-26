// PASTE INTO: client/src/routes/main/project/index.tsx

import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Link, useParams } from "react-router";
import ProjectCard from "@/components/features/project-card";
import { Seo } from "@/components/provider/seo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlurImage } from "@/components/ui/blur-image";
import NotFound from "@/components/ui/not-found";
import { useProject, useProjects } from "@/hooks/use-project";
import {
  getBlurPlaceholderUrl,
  getOptimizedImageUrl,
  initials,
} from "@/lib/utils";
import CtaSection from "@/routes/main/home/cta-section";

export default function Project() {
  const { projectId } = useParams<{ slug: string; projectId: string }>();
  const { data: project, isLoading, isError } = useProject(projectId);
  // Fetch a page of projects to populate the "More Projects" strip.
  const { data: projectsPage } = useProjects({ page: 1 });

  if (isLoading) return <ProjectSkeleton />;

  if (isError || !project) {
    return <NotFound />;
  }

  const cover = getOptimizedImageUrl(project.coverImageUrl, 1280, 720);
  const memberCount = project.teamMembers.length;
  const links = project.links ?? {};
  const hasLinks = Boolean(links.url || links.github || links.figma);
  const moreProjects = (projectsPage?.items ?? [])
    .filter((p) => p._id !== project._id)
    .slice(0, 3);

  return (
    <>
      {/* Dynamic SEO — overrides the route's static handle.seo with real data. */}
      <Seo
        title={project.title}
        description={project.summary ?? project.description.slice(0, 155)}
        image={project.coverImageUrl}
      />

      <article className="mx-auto max-w-7xl px-4 pt-25 sm:px-6 lg:px-25">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        {/* Title + meta */}
        <header className="mt-6 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-mainBlack sm:text-4xl">
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

        {/* Cover banner (the project's designed cover image) */}
        {cover && (
          <BlurImage
            src={cover}
            alt={project.title}
            blurSrc={getBlurPlaceholderUrl(cover)}
            className="mt-8 aspect-video w-full rounded-2xl border border-border"
          />
        )}

        {/* Description */}
        {project.description && (
          <p className="mt-8 whitespace-pre-line text-xl leading-[38.4px] text-lightGray">
            {project.description}
          </p>
        )}

        {/* Team members */}
        {memberCount > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-mainBlack">
              Team Members
            </h2>
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
                  <span className="text-sm font-medium text-mainBlack">
                    {m.name}
                  </span>
                  {m.role && (
                    <span className="text-xs text-muted-foreground">
                      {m.role}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Project link */}
        {hasLinks && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-mainBlack">
              Project Link
            </h2>
            <div className="mt-3 flex flex-col items-start gap-2">
              {links.url && (
                <a
                  href={links.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit break-all text-mainBlue hover:underline"
                >
                  {links.url}
                </a>
              )}
              {links.figma && (
                <a
                  href={links.figma}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit break-all text-mainBlue hover:underline"
                >
                  {links.figma}
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit break-all text-mainBlue hover:underline"
                >
                  {links.github}
                </a>
              )}
            </div>
          </section>
        )}

        {/* More projects */}
        {moreProjects.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-mainBlack">
                More Projects
              </h2>
              <Link
                to="/"
                className="text-sm font-medium text-mainBlue hover:underline"
              >
                See All
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreProjects.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Reused call-to-action band (same as the home page) */}
      <CtaSection />
    </>
  );
}

/** Lightweight loading placeholder that mirrors the page layout. */
function ProjectSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pt-25 sm:px-6 lg:px-25">
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
