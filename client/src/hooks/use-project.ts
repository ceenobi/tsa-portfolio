import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@tsa/shared";
import { MOCK_PROJECT } from "./project.mock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      if (USE_MOCK) return MOCK_PROJECT;
      const res = await api.get<Project>(`/projects/${projectId}`);
      return res.body; // ApiSuccessResponse<Project> → Project
    },
  });
}
