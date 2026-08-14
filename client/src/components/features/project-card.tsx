import { Link } from "react-router";

type ProjectProps = {
  _id: string;
  title: string;
  category: string;
  cohort: string;
  members: number;
  photoId: string;
}

export default function ProjectCard({ project }: { project: ProjectProps }) {
  return (
    <Link to={`/projects/${project.title.replace(/\s+/g, '-').toLowerCase()}/${project._id}`}>
        <article key={project.title}>
          <img
            src={`https://images.unsplash.com/photo-${project.photoId}?w=400&h=250&fit=crop&auto=format`}
            alt={project.title}
            className="mx-auto h-62.5 w-100 max-w-full rounded-[30px] object-cover"
          />

          <div className="p-4">
            <h3 className=" text-[20px] font-normal">{project.category}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <img src="/images/Calendar.svg" className="size-4" alt="" />
                {project.cohort}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <img src="/images/User.svg" className="size-4" alt="" />
                {project.members} members
              </span>
            </p>
          </div>
        </article>
    </Link>
  );
}
