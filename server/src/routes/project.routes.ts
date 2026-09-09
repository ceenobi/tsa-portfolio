import { createProjectSchema } from "@tsa/shared";
import { Router } from "express";
import {
	addAProject,
	deleteAProject,
	editAProject,
	getFeaturedProjectsController,
	getProjectById,
	getProjects,
	recentlyAddedProjects,
} from "../controllers/project.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import { customRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateFormData } from "../middlewares/schema.middleware.js";

const router = Router();

router.get(
  "/",
  customRateLimiter(60),
  cacheMiddleware(3600, { listNamespace: "projects" }),
  getProjects,
);

router.get(
	"/recent",
	customRateLimiter(60),
	requireRole("admin", "super_admin"),
	cacheMiddleware(60, { listNamespace: "projects" }),
	recentlyAddedProjects,
);

// Featured must precede /:projectId or "featured" reads as an id.
router.get(
	"/featured",
	customRateLimiter(60),
	cacheMiddleware(300, { listNamespace: "projects" }),
	getFeaturedProjectsController,
);

router.get(
	"/:projectId",
	customRateLimiter(60),
	cacheMiddleware(3600),
	getProjectById,
);

router.post(
	"/add",
	customRateLimiter(10),
	requireRole("admin", "super_admin"),
	validateFormData(createProjectSchema),
	addAProject,
);  

router.patch(
	"/edit/:projectId",
	customRateLimiter(10),
	requireRole("admin", "super_admin"),
	validateFormData(createProjectSchema),
	editAProject
);

router.delete(
	"/delete/:projectId",
	customRateLimiter(10),
	requireRole("admin", "super_admin"),
	deleteAProject
);

export default router;
