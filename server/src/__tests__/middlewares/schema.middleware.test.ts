import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateFormData } from "../../middlewares/schema.middleware";

vi.mock("../../config/logger.js", () => ({
	default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
	logError: vi.fn(),
}));

function mockReq(body?: unknown): Request {
	return { body } as unknown as Request;
}

function mockRes(): Response {
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	} as unknown as Response;
}

const next = vi.fn() as NextFunction;

const testSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email"),
});

describe("validateFormData", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls next and replaces req.body with parsed data on valid input", () => {
		const req = mockReq({ name: "Alice", email: "alice@example.com" });
		const res = mockRes();
		const middleware = validateFormData(testSchema);
		middleware(req, res, next);
		expect(next).toHaveBeenCalledWith();
		expect(req.body).toEqual({ name: "Alice", email: "alice@example.com" });
	});

	it("strips unknown keys", () => {
		const req = mockReq({
			name: "Alice",
			email: "alice@example.com",
			extra: "should be removed",
		});
		const res = mockRes();
		const middleware = validateFormData(testSchema);
		middleware(req, res, next);
		expect(req.body).not.toHaveProperty("extra");
	});

	it("returns 400 on validation failure", () => {
		const req = mockReq({ name: "", email: "not-email" });
		const res = mockRes();
		const middleware = validateFormData(testSchema);
		middleware(req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ success: false }),
		);
	});

	it("returns 400 with details for missing fields", () => {
		const req = mockReq({});
		const res = mockRes();
		const middleware = validateFormData(testSchema);
		middleware(req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("passes non-ZodError to next", () => {
		const req = mockReq({ name: "Alice", email: "alice@example.com" });
		const res = mockRes();
		const throwingSchema = {
			parse: () => {
				throw new Error("non-zod error");
			},
		};
		const middleware = validateFormData(throwingSchema);
		middleware(req, res, next);
		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});
