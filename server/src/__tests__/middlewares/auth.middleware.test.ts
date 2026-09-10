import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../config/keys.js", () => ({
	get env() {
		return { CRON_SECRET: "test-cron-secret-123" };
	},
}));

vi.mock("../../config/logger.js", () => ({
	default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
	logError: vi.fn(),
}));

import { verifySession, requireRole, verifyCronSecret } from "../../middlewares/auth.middleware";
import { appErrorHandler, notFoundRoutes } from "../../middlewares/error.middleware";

function mockReq(session?: Record<string, unknown>, headers?: Record<string, string>): Request {
	return {
		session,
		headers: headers ?? {},
		originalUrl: "/test",
	} as unknown as Request;
}

function mockRes(): Response {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	} as unknown as Response;
	return res;
}

const next = vi.fn() as NextFunction;

describe("verifySession", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls next when session has userId", () => {
		const req = mockReq({ userId: "abc123", role: "admin" });
		const res = mockRes();
		verifySession(req, res, next);
		expect(next).toHaveBeenCalled();
	});

	it("returns 401 when session is missing", () => {
		const req = mockReq();
		const res = mockRes();
		verifySession(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ success: false }),
		);
	});

	it("returns 401 when session has no userId", () => {
		const req = mockReq({ role: "admin" });
		const res = mockRes();
		verifySession(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});
});

describe("requireRole", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls next when user has matching role", () => {
		const req = mockReq({ userId: "abc", role: "admin" });
		const res = mockRes();
		const middleware = requireRole("admin", "super_admin");
		middleware(req, res, next);
		expect(next).toHaveBeenCalled();
	});

	it("returns 401 when session missing", () => {
		const req = mockReq();
		const res = mockRes();
		const middleware = requireRole("admin");
		middleware(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("returns 403 when role doesn't match", () => {
		const req = mockReq({ userId: "abc", role: "admin" });
		const res = mockRes();
		const middleware = requireRole("super_admin");
		middleware(req, res, next);
		expect(res.status).toHaveBeenCalledWith(403);
	});

	it("calls next when no roles specified and session exists", () => {
		const req = mockReq({ userId: "abc", role: "admin" });
		const res = mockRes();
		const middleware = requireRole();
		middleware(req, res, next);
		expect(next).toHaveBeenCalled();
	});
});

describe("verifyCronSecret", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls next when CRON_SECRET matches", () => {
		const req = mockReq({}, { "x-cron-secret": "test-cron-secret-123" });
		const res = mockRes();
		verifyCronSecret(req, res, next);
		expect(next).toHaveBeenCalled();
	});

	it("returns 401 when header is missing", () => {
		const req = mockReq({}, {});
		const res = mockRes();
		verifyCronSecret(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("returns 401 when header doesn't match", () => {
		const req = mockReq({}, { "x-cron-secret": "wrong" });
		const res = mockRes();
		verifyCronSecret(req, res, next);
		expect(res.status).toHaveBeenCalledWith(401);
	});
});

describe("appErrorHandler", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns 500 for unknown errors", () => {
		const req = mockReq();
		const res = mockRes();
		const err = new Error("Something broke");
		appErrorHandler(err, req, res, next);
		expect(res.status).toHaveBeenCalledWith(500);
	});

	it("returns 404 for CastError (bad ObjectId)", () => {
		const req = mockReq();
		const res = mockRes();
		const err = new Error("bad id") as any;
		err.name = "CastError";
		appErrorHandler(err, req, res, next);
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it("returns 400 for duplicate key (code 11000)", () => {
		const req = mockReq();
		const res = mockRes();
		const err = new Error("dup") as any;
		err.code = 11000;
		appErrorHandler(err, req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("returns 400 for ValidationError", () => {
		const req = mockReq();
		const res = mockRes();
		const err = new Error("validation") as any;
		err.name = "ValidationError";
		err.errors = {
			field1: { message: "Field is required" },
		};
		appErrorHandler(err, req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("returns custom status code from ErrorResponse", () => {
		const req = mockReq();
		const res = mockRes();
		const err = new Error("Not found") as any;
		err.statusCode = 422;
		appErrorHandler(err, req, res, next);
		expect(res.status).toHaveBeenCalledWith(422);
	});
});

describe("notFoundRoutes", () => {
	it("returns 404 with the original URL", () => {
		const req = mockReq({}, {});
		(req as any).originalUrl = "/api/unknown";
		const res = mockRes();
		notFoundRoutes(req, res);
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: expect.stringContaining("/api/unknown"),
			}),
		);
	});
});
