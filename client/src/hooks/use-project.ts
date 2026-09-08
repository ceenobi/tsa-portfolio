import { useMutation, useQuery } from "@tanstack/react-query";
import type { ProjectDetail, RecentProjectsOverview } from "@tsa/shared";
import { api } from "@/lib/api";
import type { ProjectsPage, SortOrder } from "@/lib/constants";
import { PAGE_SIZE, queryClient } from "@/lib/utils";

// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
// const MOCK_DELAY_MS = 300;

// function delay(ms: number) {
// 	return new Promise((resolve) => setTimeout(resolve, ms));
// }

export function useProjects({
	page = 1,
	limit = PAGE_SIZE,
	category = "All",
	sort = "Most Recent",
	query = "",
	cohort = "All",
	year = "All",
	status = "All",
}: {
	page?: number;
	limit?: number;
	category?: string;
	sort?: SortOrder;
	query?: string;
	cohort?: string;
	year?: string;
	status?: string;
} = {}) {
	return useQuery({
		queryKey: [
			"projects",
			{ page, limit, category, sort, query, cohort, year, status },
		],
		queryFn: async (): Promise<ProjectsPage> => {
			// if (USE_MOCK) {
			// 	await delay(MOCK_DELAY_MS);
			// 	return getProjectsPage({ page, limit: PAGE_SIZE, category, sort });
			// }
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (category && category !== "All") params.set("category", category);
			if (sort && sort !== "Most Recent") params.set("sort", sort);
			if (query) params.set("query", query);
			if (cohort && cohort !== "All") params.set("cohort", cohort);
			if (year && year !== "All") params.set("year", year);
			if (status && status !== "All") params.set("status", status);
			const res = await api.get<ProjectsPage>(`/projects?${params}`);
			return res.body;
		},
	});
}

export function useProject(projectId: string | undefined) {
	return useQuery({
		queryKey: ["project", projectId],
		enabled: Boolean(projectId),
		queryFn: async (): Promise<ProjectDetail> => {
			// if (USE_MOCK) return MOCK_PROJECTS.find((p) => p._id === projectId);
			const res = await api.get<ProjectDetail>(`/projects/${projectId}`);
			return res.body; // ApiSuccessResponse<ProjectDetail> → { project, recommended }
		},
	});
}

/** Admin dashboard overview — recent projects + portfolio stats. */
export function useRecentProjects() {
	return useQuery({
		queryKey: ["projects", "recent"],
		queryFn: async (): Promise<RecentProjectsOverview> => {
			const res = await api.get<RecentProjectsOverview>("/projects/recent");
			return res.body;
		},
	});
}

/** Deletes a project by ID and invalidates all project-related queries. */
export function useDeleteProject() {
	return useMutation({
		mutationFn: async (projectId: string) => {
			const res = await api.delete(`/projects/delete/${projectId}`);
			return res;
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});
}
