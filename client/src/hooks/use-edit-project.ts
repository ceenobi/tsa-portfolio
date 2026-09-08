import { useMutation } from "@tanstack/react-query";
import type { CreateProjectResponse, createProjectSchema } from "@tsa/shared";
import type { z } from "zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";

export type EditProjectInput = z.infer<typeof createProjectSchema>;

/** Edits an existing project via PATCH /projects/edit/:projectId (admin only). */
export function useEditProject(projectId: string) {
	return useMutation({
		mutationFn: async (payload: EditProjectInput) => {
			const res = await api.patch<CreateProjectResponse["body"]>(
				`/projects/edit/${projectId}`,
				payload,
			);
			return res.body;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			queryClient.invalidateQueries({ queryKey: ["project", projectId] });
		},
	});
}
