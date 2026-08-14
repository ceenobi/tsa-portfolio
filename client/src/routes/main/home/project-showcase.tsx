import ProjectCard from "@/components/features/project-card";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, } from "lucide-react";
import { useEffect, useState } from "react";

// Small enough placeholder dataset that pagination is still exercised —
// bump this up once real project counts are wired up to the backend.
const PAGE_SIZE = 6;

const range = (start: number, end: number) =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Page-number list with an ellipsis for gaps, e.g. [1, 'ellipsis', 4, 5, 6, 'ellipsis', 20].
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return range(1, total);

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 2);
  pages.push(...range(start, end));

  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

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

export interface Project {
  _id: string;
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
    _id: "1",
    title: "1918 Deluxe Auto Insurance",
    category: "Cyber Security",
    cohort: "June 2026 Cohort",
    members: 12,
    photoId: "1573164713988-8665fc963095",
  },
  {
    _id: "2",
    title: "Streamline Work Flow With AI Powered Solution",
    category: "Product Design",
    cohort: "June 2026 Cohort",
    members: 7,
    photoId: "1519389950473-47ba0277781c",
  },
  {
    _id: "3",
    title: "Accelerate Your Business Profit 10X",
    category: "Full Stack Web Development",
    cohort: "June 2026 Cohort",
    members: 9,
    photoId: "1550751827-4bd374c3f58b",
  },
  {
    _id: "4",
    title: "AI Generated Resources",
    category: "Data Analysis",
    cohort: "June 2026 Cohort",
    members: 16,
    photoId: "1522252234503-e356532cafd5",
  },
  {
    _id: "5",
    title: "Empowering Change for a Sustainable Future",
    category: "Product Design",
    cohort: "May 2026 Cohort",
    members: 3,
    photoId: "1531297484001-80022131f5a1",
  },
  {
    _id: "6",
    title: "SecureWave Threat Monitor",
    category: "Cyber Security",
    cohort: "May 2026 Cohort",
    members: 8,
    photoId: "1526374965328-7f61d4dc18c5",
  },
  {
    _id: "7",
    title: "Experience Seamless and Automated Event Ticketing",
    category: "Full Stack Web Development",
    cohort: "May 2026 Cohort",
    members: 13,
    photoId: "1518770660439-4636190af475",
  },
  {
    _id: "8",
    title: "Read Stories, Speak Stories",
    category: "Data Analysis",
    cohort: "May 2026 Cohort",
    members: 6,
    photoId: "1563986768609-322da13575f3",
  },
  {
    _id: "9",
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
  const [page, setPage] = useState(1);

  const filtered =
    category === "All"
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === category);

  // PROJECTS is authored most-recent-cohort-first, so "Oldest" is just the
  // reverse — swap for a real date sort once cohorts carry actual dates.
  const sorted = sortOrder === "Most Recent" ? filtered : [...filtered].reverse();

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const projects = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Changing the filter/sort can make the current page out of range —
  // snap back to page 1 instead of showing an empty grid.
  useEffect(() => {
    const handlePageChange = () => setPage(1);
    window.addEventListener("scroll", handlePageChange);
    return () => window.removeEventListener("scroll", handlePageChange);
  }, [category, sortOrder]);

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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard project={project} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {PAGE_SIZE} Entries per page
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.75">
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to previous page"
                  aria-disabled={page === 1}
                  size="icon"
                  className={cn(
                    "size-7 rounded-md border-transparent",
                    page === 1
                      ? "pointer-events-none bg-muted text-muted-foreground opacity-60"
                      : "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                >
                  <ChevronLeft />
                </PaginationLink>
              </PaginationItem>

              {getPageNumbers(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      className={cn(
                        "size-7 border-transparent bg-transparent text-sm font-medium text-[#878789] hover:bg-transparent hover:underline",
                        item === page && "font-semibold text-[#E00017]",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to next page"
                  aria-disabled={page === totalPages}
                  size="icon"
                  className={cn(
                    "size-7 rounded-md border-transparent",
                    page === totalPages
                      ? "pointer-events-none bg-muted text-muted-foreground opacity-60"
                      : "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                >
                  <ChevronRight />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  );
}
