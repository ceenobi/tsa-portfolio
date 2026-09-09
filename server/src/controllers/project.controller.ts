import type {
	CreateProjectResponse,
	GetFeaturedProjectsResponse,
	GetProjectResponse,
	GetProjectsResponse,
	GetRecentProjectsResponse,
} from "@tsa/shared";
import type { Request, Response } from "express";
import { sendTsRestError, sendTsRestSuccess } from "../libs/responseHandler.js";
import tryCatchWrapper from "../libs/tryCatchWrapper.js";
import {
	createProject,
	deleteProject,
	editProject,
	getFeaturedProjects,
	getProject,
	getRecentlyAddedProjects,
	invalidateProjectCaches,
	listProjects,
} from "../services/projectService.js";

export const addAProject = tryCatchWrapper(
	async (req: Request, res: Response) => {
		// Session is guaranteed by requireRole on the route.
		const createdBy = req.session.userId as string;

		const result = await createProject({ ...req.body, createdBy });

		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		await invalidateProjectCaches();

		return sendTsRestSuccess<CreateProjectResponse["body"]>(res, 201, {
			success: true,
			message: "Project created successfully.",
			body: { project: result.project },
		});
	},
);

export const getProjects = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 6;
		const category =
			typeof req.query.category === "string" ? req.query.category : undefined;
		const sort =
			typeof req.query.sort === "string" ? req.query.sort : undefined;
		const query =
			typeof req.query.query === "string" ? req.query.query : undefined;
		const cohort =
			typeof req.query.cohort === "string" ? req.query.cohort : undefined;
		const year = typeof req.query.year === "string" ? req.query.year : undefined;
		const status =
			typeof req.query.status === "string" ? req.query.status : undefined;

		const result = await listProjects({
			page,
			limit,
			category,
			sort,
			query,
			cohort,
			year,
			status,
		});

		return sendTsRestSuccess<GetProjectsResponse["body"]>(res, 200, {
			success: true,
			message: "Projects fetched successfully.",
			body: result,
		});
	},
);

export const getProjectById = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const { projectId } = req.params;

		const result = await getProject(String(projectId));

		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		return sendTsRestSuccess<GetProjectResponse["body"]>(res, 200, {
			success: true,
			message: "Project fetched successfully.",
			body: {
				project: result.project,
				recommended: result.recommended,
			},
		});
	},
);

//dashboard controllers
export const recentlyAddedProjects = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await getRecentlyAddedProjects();
		return sendTsRestSuccess<GetRecentProjectsResponse["body"]>(res, 200, {
			success: true,
			message: "Dashboard overview fetched successfully.",
			body: result,
		});
	},
);

export const editAProject = tryCatchWrapper(
	async (req: Request, res: Response) => {
		// Session is guaranteed by requireRole on the route.
		const createdBy = req.session.userId as string;

		const { projectId } = req.params;
		const result = await editProject({ ...req.body, createdBy, _id: projectId });

		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		await invalidateProjectCaches(String(projectId));

		return sendTsRestSuccess<CreateProjectResponse["body"]>(res, 200, {
			success: true,
			message: "Project updated successfully.",
			body: { project: result.project },
		});
	},
);

export const deleteAProject = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const { projectId } = req.params;
		const result = await deleteProject(String(projectId));

		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		await invalidateProjectCaches(String(projectId));

		return sendTsRestSuccess<undefined>(res, 200, {
			success: true,
			message: result.message,
		});
	},
);


// Homepage featured projects — reshuffled daily (see service).
export const getFeaturedProjectsController = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const result = await getFeaturedProjects();
		return sendTsRestSuccess<GetFeaturedProjectsResponse["body"]>(res, 200, {
			success: true,
			message: "Featured projects fetched successfully.",
			body: result,
		});
	},
);
