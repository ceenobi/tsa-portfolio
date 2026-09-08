import { useMutation } from "@tanstack/react-query";
import type { CreateProjectResponse, createProjectSchema } from "@tsa/shared";
import type { z } from "zod";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UploadedMedia = { mediaUrl: string; publicId: string };

/** Uploads base64 data URLs to Cloudinary via POST /upload → [{ mediaUrl, publicId }]. */
export function useUploadFiles() {
	return useMutation({
		mutationFn: async (vars: { files: string[]; folder: string }) => {
			const res = await api.post<UploadedMedia[]>("/upload", vars);
			return res.body;
		},
	});
}

/** Creates a project via POST /projects/add (admin only). */
export function useCreateProject() {
	return useMutation({
		mutationFn: async (payload: CreateProjectInput) => {
			const res = await api.post<CreateProjectResponse["body"]>(
				"/projects/add",
				payload,
			);
			return res.body;
		},
		onSuccess: () => {
			// Refresh the portfolio list + dashboard stats after a create.
			queryClient.invalidateQueries();
		},
	});
}
