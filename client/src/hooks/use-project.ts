import { useQuery } from "@tanstack/react-query";
import type { Project } from "@tsa/shared";
import { api } from "@/lib/api";
import {
	getProjectsPage,
	MOCK_PROJECTS,
	type ProjectsPage,
	type SortOrder,
} from "@/lib/constants";
import { PAGE_SIZE } from "@/lib/utils";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const MOCK_DELAY_MS = 300;

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useProjects({
	page = 1,
	category = "All",
	sort = "Most Recent",
}: {
	page?: number;
	category?: string;
	sort?: SortOrder;
} = {}) {
	return useQuery({
		queryKey: ["projects", { page, category, sort }],
		queryFn: async (): Promise<ProjectsPage> => {
			if (USE_MOCK) {
				await delay(MOCK_DELAY_MS);
				return getProjectsPage({ page, limit: PAGE_SIZE, category, sort });
			}

			const params = new URLSearchParams({
				page: String(page),
				limit: String(PAGE_SIZE),
			});
			if (category && category !== "All") params.set("category", category);
			if (sort && sort !== "Most Recent") params.set("sort", sort);
			const res = await api.get<ProjectsPage>(`/projects?${params}`);
			return res.body;
		},
	});
}

export function useProject(projectId: string | undefined) {
	return useQuery({
		queryKey: ["project", projectId],
		enabled: Boolean(projectId),
		queryFn: async () => {
			if (USE_MOCK) return MOCK_PROJECTS.find((p) => p._id === projectId);
			const res = await api.get<Project>(`/projects/${projectId}`);
			return res.body; // ApiSuccessResponse<Project> → Project
		},
	});
}