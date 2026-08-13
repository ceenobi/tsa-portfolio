import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Product Design",
  "Full Stack Web Development",
  "Data Analysis",
  "Cyber Security",
] as const;

type Category = (typeof CATEGORIES)[number];

const SORT_OPTIONS = ["Most Recent", "Oldest"] as const;

type SortOrder = (typeof SORT_OPTIONS)[number];

interface Project {
  title: string;
  category: Exclude<Category, "All">;
  cohort: string;
  members: number;
  photoId: string;
}

// Placeholder sample data — swap for real cohort projects once the backend
// endpoint is wired up. `photoId` is an Unsplash photo id used as a stand-in
// cover image until each project has a real screenshot.
const PROJECTS: Project[] = [
  {
    title: "1918 Deluxe Auto Insurance",
    category: "Cyber Security",
    cohort: "June 2026 Cohort",
    members: 12,
    photoId: "1573164713988-8665fc963095",
  },
  {
    title: "Streamline Work Flow With AI Powered Solution",
    category: "Product Design",
    cohort: "June 2026 Cohort",
    members: 7,
    photoId: "1519389950473-47ba0277781c",
  },
  {
    title: "Accelerate Your Business Profit 10X",
    category: "Full Stack Web Development",
    cohort: "June 2026 Cohort",
    members: 9,
    photoId: "1550751827-4bd374c3f58b",
  },
  {
    title: "AI Generated Resources",
    category: "Data Analysis",
    cohort: "June 2026 Cohort",
    members: 16,
    photoId: "1522252234503-e356532cafd5",
  },
  {
    title: "Empowering Change for a Sustainable Future",
    category: "Product Design",
    cohort: "May 2026 Cohort",
    members: 3,
    photoId: "1531297484001-80022131f5a1",
  },
  {
    title: "SecureWave Threat Monitor",
    category: "Cyber Security",
    cohort: "May 2026 Cohort",
    members: 8,
    photoId: "1526374965328-7f61d4dc18c5",
  },
  {
    title: "Experience Seamless and Automated Event Ticketing",
    category: "Full Stack Web Development",
    cohort: "May 2026 Cohort",
    members: 13,
    photoId: "1518770660439-4636190af475",
  },
  {
    title: "Read Stories, Speak Stories",
    category: "Data Analysis",
    cohort: "May 2026 Cohort",
    members: 6,
    photoId: "1563986768609-322da13575f3",
  },
  {
    title: "Network Intrusion Detection Suite",
    category: "Cyber Security",
    cohort: "May 2026 Cohort",
    members: 5,
    photoId: "1573164713988-8665fc963095",
  },
];

export default function ProjectShowcase() {
  const [category, setCategory] = useState<Category>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Most Recent");

  const filtered =
    category === "All"
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === category);

  // PROJECTS is authored most-recent-cohort-first, so "Oldest" is just the
  // reverse — swap for a real date sort once cohorts carry actual dates.
  const projects = sortOrder === "Most Recent" ? filtered : [...filtered].reverse();

  return (
    <section className="bg-[#D0D0D0]/10">
      <div className="mx-auto max-w-7xl pt-[100px] mb-[16px] sm:px-6 lg:px-[100px]">
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
                onClick={() => setCategory(item)}
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
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
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

        <div className="mt-8 grid gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title}>
              <img
                src={`https://images.unsplash.com/photo-${project.photoId}?w=400&h=250&fit=crop&auto=format`}
                alt={project.title}
                className="mx-auto h-[250px] w-[400px] max-w-full rounded-[30px] object-cover"
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
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          9 Entries per page
        </p>
      </div>
    </section>
  );
}
