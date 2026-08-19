import { Seo } from "@/components/provider/seo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { getOptimizedImageUrl } from "@/lib/utils";
import { ArrowLeft, Calendar, ExternalLink, Users } from "lucide-react";
import { Link, useParams } from "react-router";

export default function Project() {
  const { projectId } = useParams<{ slug: string; projectId: string }>();
  const { data: project, isLoading, isError, error } = useProject(projectId);

  if (isLoading) return <ProjectSkeleton />;

  if (isError || !project) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "This project may have been removed or is not published."}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link to="/" />}
          className="mt-6 h-10 px-6 text-sm"
        >
          <ArrowLeft /> Back to showcase
        </Button>
      </section>
    );
  }

  const cover = getOptimizedImageUrl(project.coverImageUrl, 1280, 720);
  const memberCount = project.teamMembers.length;
  const links = project.links ?? {};
  const hasLinks = Boolean(links.live || links.github || links.figma);

  return (
    <>
      {/* Dynamic SEO — overrides the route's static handle.seo with real data. */}
      <Seo
        title={project.title}
        description={project.summary ?? project.description.slice(0, 155)}
        image={project.coverImageUrl}
      />

      <article className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
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
          <img
            src={cover}
            alt={project.title}
            className="mt-8 aspect-video w-full rounded-2xl border border-border object-cover"
          />
        )}

        {/* Description */}
        {project.description && (
          <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground/90">
            {project.description}
          </p>
        )}

        {/* Gallery (optional) */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Gallery</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.gallery.map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={getOptimizedImageUrl(src, 800, 500)}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading="lazy"
                  className="aspect-video w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {/* Team members */}
        {memberCount > 0 && (
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
        )}

        {/* Project links */}
        {hasLinks && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Project links</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {links.live && (
                <Button
                  size="lg"
                  nativeButton={false}
                  className="h-10 px-5 text-sm"
                  render={
                    <a href={links.live} target="_blank" rel="noreferrer" />
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
        )}
      </article>
    </>
  );
}

/** First 1–2 initials from a name, for the avatar fallback. */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Lightweight loading placeholder that mirrors the page layout. */
function ProjectSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-10">
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
