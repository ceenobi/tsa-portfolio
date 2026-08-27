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
  live?: string;
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
  gallery?: string[];
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
