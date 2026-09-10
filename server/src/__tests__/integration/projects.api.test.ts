import express from "express";
import type { Request, Response, NextFunction } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { vi } from "vitest";

let mongod: MongoMemoryServer;
let app: express.Express;

beforeAll(async () => {
	// Disconnect any existing connection first
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}

	mongod = await MongoMemoryServer.create();
	await mongoose.connect(mongod.getUri());

	vi.doMock("../../config/keys.js", () => ({
		get env() {
			return {
				NODE_ENV: "test",
				CRON_SECRET: "test-secret",
				CLIENT_URL: "http://localhost:5178",
				DATABASE_NAME: "test",
			};
		},
	}));

	vi.doMock("../../config/logger.js", () => {
		const logger = {
			error: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			fatal: vi.fn(),
			child: vi.fn().mockReturnThis(),
		};
		return { default: logger, logError: vi.fn() };
	});

	vi.doMock("../../middlewares/error.middleware.js", () => ({
		createExpressLogger: () => (req: Request, _res: Response, next: NextFunction) => next(),
		setupGlobalErrorHandlers: vi.fn(),
		appErrorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => {
			res.status(500).json({ success: false, message: err.message });
		},
		notFoundRoutes: (_req: Request, res: Response) => {
			res.status(404).json({ success: false, message: "Not found" });
		},
	}));

	vi.doMock("../../config/session.js", () => ({
		createSessionMiddleware: () => (req: Request, _res: Response, next: NextFunction) => next(),
	}));

	vi.doMock("../../libs/cache.js", () => ({
		generateCacheKey: () => "test-key",
		generateVersionedKey: () => "test-versioned-key",
		getCache: async () => null,
		setCache: async () => {},
		deleteCache: async () => {},
		bumpListGeneration: async () => {},
		flushCache: async () => {},
	}));

	vi.doMock("../../middlewares/rateLimit.middleware.js", () => ({
		globalLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
		strictLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
		customRateLimiter: () => (_req: Request, _res: Response, next: NextFunction) => next(),
	}));

	vi.doMock("../../config/upload.js", () => ({
		deleteFromCloudinary: async () => {},
	}));

	vi.doMock("../../services/emailService.js", () => ({
		EmailService: {
			sendVerifyAccountEmail: async () => {},
			sendPasswordResetEmail: async () => {},
		},
	}));

	const mod = await import("../../app.js");
	app = mod.default;
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongod.stop();
	vi.restoreAllMocks();
});

afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});

describe("GET /health", () => {
	it("returns 200 with status info", async () => {
		const res = await request(app).get("/health");
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("success");
		expect(res.body.message).toBe("Server is running");
		expect(res.body.environment).toBe("test");
	});
});

describe("GET /v1/projects", () => {
	it("returns empty list when no projects exist", async () => {
		const res = await request(app).get("/v1/projects");
		expect(res.status).toBe(200);
		expect(res.body.body.items).toEqual([]);
		expect(res.body.body.total).toBe(0);
	});

	it("returns published projects only", async () => {
		const Project = mongoose.connection.collections.project;
		await Project.insertMany([
			{
				title: "Published Project",
				department: ["Full Stack Web Development"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "A published project",
				thumbnail: "https://example.com/thumb.jpg",
				coverImage: "https://example.com/cover.jpg",
				media: [{ mediaUrl: "https://example.com/img.jpg", publicId: "img1" }],
				status: "published",
				createdBy: new mongoose.Types.ObjectId(),
			},
			{
				title: "Draft Project",
				department: ["Product Design"],
				cohort: "Cohort 2",
				academicYear: "2024",
				description: "A draft project",
				thumbnail: "https://example.com/thumb2.jpg",
				coverImage: "https://example.com/cover2.jpg",
				media: [{ mediaUrl: "https://example.com/img2.jpg", publicId: "img2" }],
				status: "draft",
				createdBy: new mongoose.Types.ObjectId(),
			},
		]);

		const res = await request(app).get("/v1/projects");
		expect(res.status).toBe(200);
		expect(res.body.body.items).toHaveLength(1);
		expect(res.body.body.items[0].title).toBe("Published Project");
	});

	it("filters by department category", async () => {
		const Project = mongoose.connection.collections.project;
		await Project.insertMany([
			{
				title: "Web Dev Project",
				department: ["Full Stack Web Development"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "desc",
				thumbnail: "t.jpg",
				coverImage: "c.jpg",
				media: [{ mediaUrl: "i.jpg", publicId: "i1" }],
				status: "published",
				createdBy: new mongoose.Types.ObjectId(),
			},
			{
				title: "Design Project",
				department: ["Product Design"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "desc",
				thumbnail: "t.jpg",
				coverImage: "c.jpg",
				media: [{ mediaUrl: "i.jpg", publicId: "i1" }],
				status: "published",
				createdBy: new mongoose.Types.ObjectId(),
			},
		]);

		const res = await request(app).get(
			"/v1/projects?category=Product+Design",
		);
		expect(res.status).toBe(200);
		expect(res.body.body.items).toHaveLength(1);
		expect(res.body.body.items[0].title).toBe("Design Project");
	});

	it("paginates results", async () => {
		const Project = mongoose.connection.collections.project;
		const docs = Array.from({ length: 15 }, (_, i) => ({
			title: `Project ${i}`,
			department: ["Full Stack Web Development"],
			cohort: "Cohort 1",
			academicYear: "2024",
			description: "desc",
			thumbnail: "t.jpg",
			coverImage: "c.jpg",
			media: [{ mediaUrl: "i.jpg", publicId: `i${i}` }],
			status: "published",
			createdBy: new mongoose.Types.ObjectId(),
		}));
		await Project.insertMany(docs);

		const res = await request(app).get("/v1/projects?page=1&limit=6");
		expect(res.status).toBe(200);
		expect(res.body.body.items).toHaveLength(6);
		expect(res.body.body.total).toBe(15);
		expect(res.body.body.totalPages).toBe(3);
	});
});

describe("GET /v1/projects/featured", () => {
	it("returns empty array when no published projects", async () => {
		const res = await request(app).get("/v1/projects/featured");
		expect(res.status).toBe(200);
		expect(res.body.body).toEqual([]);
	});

	it("returns up to 6 featured published projects", async () => {
		const Project = mongoose.connection.collections.project;
		await Project.insertMany(
			Array.from({ length: 8 }, (_, i) => ({
				title: `Featured ${i}`,
				department: ["Full Stack Web Development"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "desc",
				thumbnail: "t.jpg",
				coverImage: "c.jpg",
				media: [{ mediaUrl: "i.jpg", publicId: `i${i}` }],
				status: "published",
				createdBy: new mongoose.Types.ObjectId(),
			})),
		);

		const res = await request(app).get("/v1/projects/featured");
		expect(res.status).toBe(200);
		expect(res.body.body.length).toBeLessThanOrEqual(6);
		expect(res.body.body.length).toBeGreaterThan(0);
	});

	it("excludes draft projects", async () => {
		const Project = mongoose.connection.collections.project;
		await Project.insertMany([
			{
				title: "Published",
				department: ["Product Design"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "desc",
				thumbnail: "t.jpg",
				coverImage: "c.jpg",
				media: [{ mediaUrl: "i.jpg", publicId: "i1" }],
				status: "published",
				createdBy: new mongoose.Types.ObjectId(),
			},
			{
				title: "Draft",
				department: ["Product Design"],
				cohort: "Cohort 1",
				academicYear: "2024",
				description: "desc",
				thumbnail: "t.jpg",
				coverImage: "c.jpg",
				media: [{ mediaUrl: "i.jpg", publicId: "i2" }],
				status: "draft",
				createdBy: new mongoose.Types.ObjectId(),
			},
		]);

		const res = await request(app).get("/v1/projects/featured");
		expect(res.status).toBe(200);
		expect(res.body.body).toHaveLength(1);
		expect(res.body.body[0].title).toBe("Published");
	});
});

describe("GET /v1/projects/:projectId", () => {
	it("returns 404 for non-existent project", async () => {
		const fakeId = new mongoose.Types.ObjectId().toString();
		const res = await request(app).get(`/v1/projects/${fakeId}`);
		expect(res.status).toBe(404);
	});

	it("returns 404 for invalid ObjectId", async () => {
		const res = await request(app).get("/v1/projects/invalid-id");
		expect(res.status).toBe(404);
	});

	it("returns a published project by id", async () => {
		const Project = mongoose.connection.collections.project;
		const doc = await Project.insertOne({
			title: "Detail Project",
			department: ["Data Analysis"],
			cohort: "Cohort 3",
			academicYear: "2025",
			description: "A detailed project",
			thumbnail: "https://example.com/t.jpg",
			coverImage: "https://example.com/c.jpg",
			media: [{ mediaUrl: "https://example.com/i.jpg", publicId: "img1" }],
			teamMembers: [{ fullName: "Alice", image: "https://example.com/alice.jpg" }],
			status: "published",
			createdBy: new mongoose.Types.ObjectId(),
		});

		const res = await request(app).get(`/v1/projects/${doc.insertedId}`);
		expect(res.status).toBe(200);
		expect(res.body.body.project.title).toBe("Detail Project");
		expect(res.body.body.project.category).toBe("Data Analysis");
		expect(res.body.body.project.year).toBe("2025");
	});

	it("returns 404 for draft project", async () => {
		const Project = mongoose.connection.collections.project;
		const doc = await Project.insertOne({
			title: "Draft Detail",
			department: ["Cyber Security"],
			cohort: "Cohort 1",
			academicYear: "2024",
			description: "draft",
			thumbnail: "t.jpg",
			coverImage: "c.jpg",
			media: [{ mediaUrl: "i.jpg", publicId: "i1" }],
			status: "draft",
			createdBy: new mongoose.Types.ObjectId(),
		});

		const res = await request(app).get(`/v1/projects/${doc.insertedId}`);
		expect(res.status).toBe(404);
	});
});

describe("404 fallback", () => {
	it("returns 404 for unknown routes", async () => {
		const res = await request(app).get("/v1/unknown");
		expect(res.status).toBe(404);
		expect(res.body.success).toBe(false);
	});
});
