import type { createProjectSchema, Project, ProjectDoc } from "@tsa/shared";
import { PROJECT_DEPARTMENTS } from "@tsa/shared";
import { isValidObjectId, type QueryFilter } from "mongoose";
import type { z } from "zod";
import logger from "../config/logger.js";
import ProjectModel, { type IProject } from "../models/project.js";

type CreateProjectInput = z.infer<typeof createProjectSchema> & {
	createdBy: string;
};

type CreateProjectResult =
	| { success: true; project: ProjectDoc }
	| { success: false; status: number; message: string };

export const createProject = async (
	data: CreateProjectInput,
): Promise<CreateProjectResult> => {
	const existing = await ProjectModel.findOne({
		title: data.title,
		cohort: data.cohort,
		academicYear: data.academicYear,
	}).lean();
	if (existing) {
		return {
			success: false,
			status: 409,
			message: "A project with this title already exists in this cohort.",
		};
	}

	const project = await ProjectModel.create({ ...data });

	logger.info({ projectId: project._id }, "Project created");

	return {
		success: true,
		project: {
			_id: project._id.toString(),
			title: project.title,
			department: project.department,
			cohort: project.cohort,
			academicYear: project.academicYear,
			description: project.description,
			thumbnail: project.thumbnail,
			coverImage: project.coverImage,
			media: project.media,
			teamMembers: project.teamMembers,
			links: project.links,
			status: project.status,
			createdBy: project.createdBy.toString(),
			createdAt: project.createdAt?.toISOString(),
			updatedAt: project.updatedAt?.toISOString(),
		},
	};
};

const slugify = (text: string): string =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const toProjectView = (doc: IProject): Project => ({
	_id: doc._id.toString(),
	slug: slugify(doc.title),
	title: doc.title,
	category: doc.department[0],
	cohort: doc.cohort,
	year: doc.academicYear,
	description: doc.description,
	coverImageUrl: doc.coverImage,
	media: doc.media ?? [],
	teamMembers: (doc.teamMembers ?? []).map((member) => ({
		name: member.fullName,
		avatarUrl: member.image,
	})),
	links: doc.links ? { ...doc.links } : undefined,
	status: doc.status,
	createdAt: doc.createdAt?.toISOString(),
	updatedAt: doc.updatedAt?.toISOString(),
});

export type ProjectsList = {
	items: Project[];
	page: number;
	totalPages: number;
	total: number;
};

export const listProjects = async ({
	page = 1,
	limit = 6,
	category,
	sort,
}: {
	page?: number;
	limit?: number;
	category?: string;
	sort?: string;
}): Promise<ProjectsList> => {
	const safePage = Math.max(1, Math.floor(page) || 1);
	const safeLimit = Math.min(50, Math.max(1, Math.floor(limit) || 6));

	const filter: QueryFilter<IProject> = { status: "published" };
	if (
		category &&
		category !== "All" &&
		(PROJECT_DEPARTMENTS as readonly string[]).includes(category)
	) {
		filter.department = category as (typeof PROJECT_DEPARTMENTS)[number];
	}

	const order: 1 | -1 = sort === "Oldest" ? 1 : -1;

	const [items, total] = await Promise.all([
		ProjectModel.find(filter)
			.sort({ createdAt: order })
			.skip((safePage - 1) * safeLimit)
			.limit(safeLimit)
			.lean(),
		ProjectModel.countDocuments(filter),
	]);

	return {
		items: items.map((doc) => toProjectView(doc as unknown as IProject)),
		page: safePage,
		totalPages: Math.max(1, Math.ceil(total / safeLimit)),
		total,
	};
};

export const getProject = async (
	projectId: string,
): Promise<
	| { success: true; project: Project }
	| { success: false; status: number; message: string }
> => {
	if (!isValidObjectId(projectId)) {
		return {
			success: false,
			status: 404,
			message: "Project not found.",
		};
	}

	const doc = await ProjectModel.findOne({
		_id: projectId,
		status: "published",
	}).lean();
	if (!doc) {
		return {
			success: false,
			status: 404,
			message: "Project not found.",
		};
	}

	return { success: true, project: toProjectView(doc as unknown as IProject) };
};
