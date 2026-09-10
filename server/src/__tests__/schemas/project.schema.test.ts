import { describe, it, expect } from "vitest";
import {
	createProjectSchema,
	PROJECT_DEPARTMENTS,
	PROJECT_STATUS,
} from "@tsa/shared";

const validPayload = {
	title: "Test Project",
	department: ["Full Stack Web Development"],
	cohort: "Cohort 1",
	academicYear: "2024",
	description: "A test project description",
	thumbnail: "https://example.com/thumb.jpg",
	coverImage: "https://example.com/cover.jpg",
	media: [{ mediaUrl: "https://example.com/img.jpg", publicId: "img1" }],
};

describe("createProjectSchema", () => {
	it("accepts minimal valid payload", () => {
		const result = createProjectSchema.safeParse(validPayload);
		expect(result.success).toBe(true);
	});

	it("defaults status to draft", () => {
		const result = createProjectSchema.safeParse(validPayload);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("draft");
	});

	it("accepts published status", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			status: "published",
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("published");
	});

	it("defaults teamMembers to empty array", () => {
		const result = createProjectSchema.safeParse(validPayload);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.teamMembers).toEqual([]);
	});

	it("rejects empty title", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			title: "",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing title", () => {
		const { title, ...rest } = validPayload;
		const result = createProjectSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it("rejects invalid department", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			department: ["Invalid Department"],
		});
		expect(result.success).toBe(false);
	});

	it("rejects empty department array", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			department: [],
		});
		expect(result.success).toBe(false);
	});

	it("accepts all valid departments", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			department: [...PROJECT_DEPARTMENTS],
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid academicYear format", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			academicYear: "24",
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-numeric academicYear", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			academicYear: "abcd",
		});
		expect(result.success).toBe(false);
	});

	it("accepts valid 4-digit academicYear", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			academicYear: "2025",
		});
		expect(result.success).toBe(true);
	});

	it("rejects description over 2000 chars", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			description: "x".repeat(2001),
		});
		expect(result.success).toBe(false);
	});

	it("accepts description at exactly 2000 chars", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			description: "x".repeat(2000),
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty media array", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			media: [],
		});
		expect(result.success).toBe(false);
	});

	it("rejects more than 10 media items", () => {
		const media = Array.from({ length: 11 }, (_, i) => ({
			mediaUrl: `https://example.com/${i}.jpg`,
			publicId: `img${i}`,
		}));
		const result = createProjectSchema.safeParse({
			...validPayload,
			media,
		});
		expect(result.success).toBe(false);
	});

	it("accepts exactly 10 media items", () => {
		const media = Array.from({ length: 10 }, (_, i) => ({
			mediaUrl: `https://example.com/${i}.jpg`,
			publicId: `img${i}`,
		}));
		const result = createProjectSchema.safeParse({
			...validPayload,
			media,
		});
		expect(result.success).toBe(true);
	});

	it("rejects more than 20 team members", () => {
		const teamMembers = Array.from({ length: 21 }, (_, i) => ({
			fullName: `Member ${i}`,
		}));
		const result = createProjectSchema.safeParse({
			...validPayload,
			teamMembers,
		});
		expect(result.success).toBe(false);
	});

	it("accepts empty string for link URLs (optional)", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			links: { url: "", github: "", figma: "" },
		});
		expect(result.success).toBe(true);
	});

	it("accepts valid URLs for links", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			links: {
				url: "https://example.com",
				github: "https://github.com/user/repo",
				figma: "https://figma.com/file/abc",
			},
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid URL for links", () => {
		const result = createProjectSchema.safeParse({
			...validPayload,
			links: { url: "not-a-url" },
		});
		expect(result.success).toBe(false);
	});
});

describe("PROJECT_DEPARTMENTS constant", () => {
	it("contains 4 departments", () => {
		expect(PROJECT_DEPARTMENTS).toHaveLength(4);
	});

	it("includes expected departments", () => {
		expect(PROJECT_DEPARTMENTS).toContain("Product Design");
		expect(PROJECT_DEPARTMENTS).toContain("Full Stack Web Development");
		expect(PROJECT_DEPARTMENTS).toContain("Data Analysis");
		expect(PROJECT_DEPARTMENTS).toContain("Cyber Security");
	});
});

describe("PROJECT_STATUS constant", () => {
	it("contains draft and published", () => {
		expect(PROJECT_STATUS).toEqual(["draft", "published"]);
	});
});
