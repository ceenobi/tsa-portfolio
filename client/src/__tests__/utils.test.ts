import { describe, it, expect } from "vitest";
import {
	getOptimizedImageUrl,
	getBlurPlaceholderUrl,
	initials,
	getPageNumbers,
} from "../lib/utils";

describe("getOptimizedImageUrl", () => {
	const cloudinaryBase = "https://res.cloudinary.com/demo/image/upload/";
	const cloudinaryPath = "v1234/sample.jpg";

	it("returns undefined for undefined input", () => {
		expect(getOptimizedImageUrl(undefined, 800)).toBeUndefined();
	});

	it("returns undefined for null input", () => {
		expect(getOptimizedImageUrl(null, 800)).toBeUndefined();
	});

	it("returns undefined for empty string", () => {
		expect(getOptimizedImageUrl("", 800)).toBeUndefined();
	});

	it("passes through non-Cloudinary URLs", () => {
		const url = "https://example.com/image.jpg";
		expect(getOptimizedImageUrl(url, 800)).toBe(url);
	});

	it("injects transform params into Cloudinary URLs", () => {
		const url = `${cloudinaryBase}${cloudinaryPath}`;
		const result = getOptimizedImageUrl(url, 800);
		expect(result).toContain("w_800,h_800,c_fill,q_auto,f_auto");
		expect(result).toContain(cloudinaryPath);
	});

	it("uses provided height when given", () => {
		const url = `${cloudinaryBase}${cloudinaryPath}`;
		const result = getOptimizedImageUrl(url, 800, 500);
		expect(result).toContain("w_800,h_500");
	});

	it("preserves existing query params in path", () => {
		const url = `${cloudinaryBase}v1234/sample.jpg?foo=bar`;
		const result = getOptimizedImageUrl(url, 800);
		expect(result).toContain("w_800,h_800");
	});
});

describe("getBlurPlaceholderUrl", () => {
	it("returns undefined for undefined", () => {
		expect(getBlurPlaceholderUrl(undefined)).toBeUndefined();
	});

	it("returns undefined for null", () => {
		expect(getBlurPlaceholderUrl(null)).toBeUndefined();
	});

	it("generates blur URL for Cloudinary images", () => {
		const url = "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg";
		const result = getBlurPlaceholderUrl(url);
		expect(result).toContain("w_20,e_blur:1000");
		expect(result).toContain("sample.jpg");
	});

	it("generates blur URL for Unsplash images", () => {
		const url = "https://images.unsplash.com/photo-1234?w=800";
		const result = getBlurPlaceholderUrl(url);
		expect(result).toContain("w=20&blur=100");
		expect(result).toContain("auto=format");
	});

	it("uses ? separator for Unsplash URLs without query params", () => {
		const url = "https://images.unsplash.com/photo-1234";
		const result = getBlurPlaceholderUrl(url);
		expect(result).toContain("?w=20&blur=100");
	});

	it("returns undefined for unknown URLs", () => {
		expect(getBlurPlaceholderUrl("https://example.com/img.jpg")).toBeUndefined();
	});
});

describe("initials", () => {
	it("returns two initials for two-word name", () => {
		expect(initials("John Doe")).toBe("JD");
	});

	it("returns one initial for single word", () => {
		expect(initials("Alice")).toBe("A");
	});

	it("returns at most two initials for multi-word names", () => {
		expect(initials("One Two Three")).toBe("OT");
	});

	it("returns empty string for empty input", () => {
		expect(initials("")).toBe("");
	});

	it("trims whitespace", () => {
		expect(initials("  Alice  ")).toBe("A");
	});

	it("handles single-character words", () => {
		expect(initials("A B")).toBe("AB");
	});
});

describe("getPageNumbers", () => {
	it("returns all pages when total <= 7", () => {
		expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
		expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it("shows ellipsis at end when current is near start", () => {
		const result = getPageNumbers(1, 10);
		expect(result).toEqual([1, 2, 3, "ellipsis", 10]);
	});

	it("shows ellipsis on both sides when current is in middle", () => {
		const result = getPageNumbers(5, 10);
		expect(result).toEqual([1, "ellipsis", 4, 5, 6, 7, "ellipsis", 10]);
	});

	it("shows ellipsis at start when current is near end", () => {
		const result = getPageNumbers(10, 10);
		expect(result).toEqual([1, "ellipsis", 9, 10]);
	});

	it("handles current at boundary of ellipsis (current=3)", () => {
		const result = getPageNumbers(3, 10);
		expect(result).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
	});

	it("handles current at boundary of ellipsis (current=8)", () => {
		const result = getPageNumbers(8, 10);
		expect(result).toEqual([1, "ellipsis", 7, 8, 9, 10]);
	});

	it("handles single page total", () => {
		expect(getPageNumbers(1, 1)).toEqual([1]);
	});

	it("handles two pages total", () => {
		expect(getPageNumbers(1, 2)).toEqual([1, 2]);
	});
});
