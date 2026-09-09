import type {
	createProjectSchema,
	Project,
	ProjectDoc,
	RecentProjectsOverview,
} from "@tsa/shared";
import { PROJECT_DEPARTMENTS, PROJECT_STATUS } from "@tsa/shared";
import { isValidObjectId, type QueryFilter, Types } from "mongoose";
import type { z } from "zod";
import logger from "../config/logger.js";
import { deleteFromCloudinary } from "../config/upload.js";
import {
  buildCacheKey,
  bumpListGeneration,
  deleteCache,
} from "../libs/cache.js";
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

/**
 * Targeted invalidation after project writes — rotates the list-namespace
 * generation (cheap: one counter write) and drops the exact detail key.
 * Replaces the old whole-cache flush, so unrelated entries stay warm.
 */
export const invalidateProjectCaches = async (
  projectId?: string,
): Promise<void> => {
  await bumpListGeneration("projects");
  if (projectId) {
    await deleteCache(buildCacheKey(`/v1/projects/${projectId}`));
  }
};

export const listProjects = async ({
	page = 1,
	limit = 6,
	category,
	sort,
	query,
	cohort,
	year,
	status,
}: {
	page?: number;
	limit?: number;
	category?: string;
	sort?: string;
	query?: string;
	cohort?: string;
	year?: string;
	status?: string;
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
	if (query?.trim()) {
		const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		filter.title = { $regex: escaped, $options: "i" };
	}
	if (cohort) {
		filter.cohort = cohort;
	}
	if (year) {
		filter.academicYear = year;
	}
	// Only applied when explicitly requested — public listing stays published-only.
	if (status && (PROJECT_STATUS as readonly string[]).includes(status)) {
		filter.status = status as (typeof PROJECT_STATUS)[number];
	}

	const order: 1 | -1 = sort === "Oldest" ? 1 : -1;

  const [items, total] = await Promise.all([
    ProjectModel.find(filter)
      // List cards never render the (up to 2KB) description — leave it out.
      .select("-description")
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

const RECOMMENDED_LIMIT = 6;

export const getRecommendedProjects = async (
	excludeId: string,
	limit: number = RECOMMENDED_LIMIT,
): Promise<Project[]> => {
	const docs = await ProjectModel.aggregate([
		{
			$match: {
				status: "published",
				_id: { $ne: new Types.ObjectId(excludeId) },
			},
		},
		{ $sample: { size: limit } },
	]);

	return docs.map((doc) => toProjectView(doc as unknown as IProject));
};

const RECENT_PROJECTS_LIMIT = 10;

export const getRecentlyAddedProjects = async (
	limit: number = RECENT_PROJECTS_LIMIT,
): Promise<RecentProjectsOverview> => {
	const safeLimit = Math.min(
		50,
		Math.max(1, Math.floor(limit) || RECENT_PROJECTS_LIMIT),
	);

	// Dashboard view — includes drafts, newest first.
	const [docs, total, draftCount] = await Promise.all([
		ProjectModel.find({})
			.sort({ createdAt: -1 })
			.limit(safeLimit)
			.lean(),
		ProjectModel.countDocuments({}),
		ProjectModel.countDocuments({ status: "draft" }),
	]);

	return {
		items: docs.map((doc) => toProjectView(doc as unknown as IProject)),
		stats: {
			totalProjects: total,
			draftProjects: draftCount,
			publishedProjects: total - draftCount,
		},
	};
};

export const getProject = async (
	projectId: string,
): Promise<
	| { success: true; project: Project; recommended: Project[] }
	| { success: false; status: number; message: string }
> => {
	if (!isValidObjectId(projectId)) {
		return {
			success: false,
			status: 404,
			message: "Project not found.",
		};
	}

  // Detail + recommendations are independent — fetch in parallel.
  // A failed recommendation must never fail the detail view.
  const [doc, recommended] = await Promise.all([
    ProjectModel.findOne({
      _id: projectId,
      status: "published",
    }).lean(),
    getRecommendedProjects(projectId).catch((error) => {
      logger.warn(
        { err: error, projectId },
        "Failed to load recommended projects",
      );
      return [] as Project[];
    }),
  ]);
  if (!doc) {
    return {
      success: false,
      status: 404,
      message: "Project not found.",
    };
  }

  return {
    success: true,
    project: toProjectView(doc as unknown as IProject),
    recommended,
  };
};

export const editProject = async (
	data: { createdBy: string; _id: string } & Partial<z.infer<typeof createProjectSchema>>,
): Promise<CreateProjectResult> => {
	const { _id, ...updateData } = data;

	if (!isValidObjectId(_id)) {
		return {
			success: false,
			status: 404,
			message: "Project not found.",
		};
	}

	const project = await ProjectModel.findByIdAndUpdate(
		_id,
		{ $set: updateData },
		{ new: true },
	).lean();

	if (!project) {
		return {
			success: false,
			status: 404,
			message: "Project not found.",
		};
	}

	logger.info({ projectId: project._id }, "Project updated");

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

export const deleteProject = async (
  projectId: string,
): Promise<
  | { success: true; message: string }
  | { success: false; status: number; message: string }
> => {
  if (!isValidObjectId(projectId)) {
    return { success: false, status: 404, message: "Project not found." };
  }

  const project = await ProjectModel.findById(projectId).lean();

  if (!project) {
    return { success: false, status: 404, message: "Project not found." };
  }

	// Clean up Cloudinary assets (best-effort, don't fail the delete).
	const publicIds = (project.media ?? [])
		.map((m: { mediaUrl: string; publicId: string }) => m.publicId)
		.filter(Boolean);

	if (publicIds.length > 0) {
		await Promise.allSettled(
			publicIds.map((id: string) => deleteFromCloudinary(id)),
		);
	}

	await ProjectModel.findByIdAndDelete(projectId);

	logger.info({ projectId: project._id }, "Project deleted");

	return { success: true, message: "Project deleted successfully." };
};

const FEATURED_LIMIT = 6;

/**
 * FNV-1a hash of the current UTC date (YYYY-MM-DD) — one seed per day,
 * so every caller sees the same featured set until midnight UTC.
 */
const dailySeed = (now: Date = new Date()): number => {
  const day = now.toISOString().slice(0, 10);
  let hash = 0x811c9dc5;
  for (let i = 0; i < day.length; i++) {
    hash ^= day.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** Deterministic PRNG (mulberry32) for the daily shuffle. */
const mulberry32 = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Homepage featured projects — up to 6 published projects, shuffled once
 * per UTC day. Deterministic (no per-request $sample, no cache-coherency
 * issues, stable across restarts and instances).
 */
export const getFeaturedProjects = async (): Promise<Project[]> => {
  const docs = await ProjectModel.find({ status: "published" })
    .select("-description")
    .lean();

  const shuffled = [...docs];
  const rand = mulberry32(dailySeed());
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled
    .slice(0, FEATURED_LIMIT)
    .map((doc) => toProjectView(doc as unknown as IProject));
};

