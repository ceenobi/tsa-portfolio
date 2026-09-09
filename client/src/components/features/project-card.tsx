import type { Project } from "@tsa/shared";
import { Link } from "react-router";
import { BlurImage } from "@/components/ui/blur-image";
import { getBlurPlaceholderUrl, getOptimizedImageUrl } from "@/lib/utils";

export default function ProjectCard({ project }: { project: Project }) {
  const cover = getOptimizedImageUrl(project.coverImageUrl, 800, 500);

  return (
    <Link to={`/projects/${project.slug}/${project._id}`} className="group">
        <article key={project.title}>
          <BlurImage
            src={cover}
            alt={project.title}
            blurSrc={getBlurPlaceholderUrl(project.coverImageUrl)}
            className="aspect-[8/5] w-full rounded-[30px] border-4 border-transparent transition-all duration-300 group-hover:border-mainBlue"
            imgClassName="group-hover:scale-105"
          />

          <div className="p-4">
            <h3 className=" text-[20px] font-normal truncate">{project.title}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <img src="/images/Calendar.svg" className="size-4" alt="" />
                {project.cohort}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <img src="/images/User.svg" className="size-4" alt="" />
                {project.teamMembers.length} members
              </span>
            </p>
          </div>
        </article>
    </Link>
  );
}
