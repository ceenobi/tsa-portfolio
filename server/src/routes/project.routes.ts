import { createProjectSchema } from "@tsa/shared";
import { Router } from "express";
import {
	addAProject,
	getProjectById,
	getProjects,
	recentlyAddedProjects,
} from "../controllers/project.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import { customRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateFormData } from "../middlewares/schema.middleware.js";

const router = Router();

router.get("/", customRateLimiter(60), cacheMiddleware(3600), getProjects);

router.get(
	"/recent",
	customRateLimiter(60),
	requireRole("admin", "super_admin"),
	recentlyAddedProjects,
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

export default router;
