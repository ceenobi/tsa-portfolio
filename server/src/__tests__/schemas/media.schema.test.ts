import { describe, it, expect } from "vitest";
import { UploadSchema, DeleteMediaSchema } from "@tsa/shared";

describe("UploadSchema", () => {
	it("accepts valid input", () => {
		const result = UploadSchema.safeParse({
			files: ["data:image/png;base64,abc123"],
			folder: "projects",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty files array", () => {
		const result = UploadSchema.safeParse({
			files: [],
			folder: "projects",
		});
		expect(result.success).toBe(false);
	});

	it("rejects empty folder", () => {
		const result = UploadSchema.safeParse({
			files: ["data:image/png;base64,abc123"],
			folder: "",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing files", () => {
		const result = UploadSchema.safeParse({
			folder: "projects",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing folder", () => {
		const result = UploadSchema.safeParse({
			files: ["data:image/png;base64,abc123"],
		});
		expect(result.success).toBe(false);
	});
});

describe("DeleteMediaSchema", () => {
	it("accepts valid input", () => {
		const result = DeleteMediaSchema.safeParse({
			mediaIds: ["img123"],
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty mediaIds array", () => {
		const result = DeleteMediaSchema.safeParse({
			mediaIds: [],
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing mediaIds", () => {
		const result = DeleteMediaSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
