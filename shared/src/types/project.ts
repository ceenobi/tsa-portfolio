import type { ApiSuccessResponse } from "./response.js";

export type ProjectStatus = "draft" | "published";

export interface ProjectTeamMember {
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface ProjectLinks {
  github?: string;
  figma?: string;
  url?: string;
}

export interface Project {
  _id: string;
  slug?: string;
  title: string;
  category: string;
  cohort: string;
  year?: string;
  summary?: string;
  description: string;
  coverImageUrl?: string;
  media?: { mediaUrl: string; publicId: string }[];
  teamMembers: ProjectTeamMember[];
  links?: ProjectLinks;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type GetProjectResponse = ApiSuccessResponse<Project>;

export type GetProjectsResponse = ApiSuccessResponse<{
  items: Project[];
  page: number;
  totalPages: number;
  total: number;
}>;

export interface ProjectDoc {
  _id: string;
  title: string;
  department: string[];
  cohort: string;
  academicYear: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  media: { mediaUrl: string; publicId: string }[];
  teamMembers: { fullName: string; image?: string }[];
  links?: { github?: string; figma?: string };
  status: ProjectStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProjectResponse = ApiSuccessResponse<{
  project: ProjectDoc;
}>;
