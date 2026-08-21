import type {
	CreateProjectResponse,
	GetProjectResponse,
	GetProjectsResponse,
} from "@tsa/shared";
import type { Request, Response } from "express";
import { flushCache } from "../libs/cache.js";
import { sendTsRestError, sendTsRestSuccess } from "../libs/responseHandler.js";
import tryCatchWrapper from "../libs/tryCatchWrapper.js";
import {
	createProject,
	getProject,
	listProjects,
} from "../services/projectService.js";

export const addAProject = tryCatchWrapper(
	async (req: Request, res: Response) => {
		const createdBy = req.session?.userId;
		if (!createdBy) {
			return sendTsRestError(res, 401, "Access denied. Please log in.");
		}

		const result = await createProject({ ...req.body, createdBy });

		if (!result.success) {
			return sendTsRestError(res, result.status, result.message);
		}

		await flushCache();

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
		const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;

		const result = await listProjects({ page, limit, category, sort });

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
			body: result.project,
		});
	},
);
