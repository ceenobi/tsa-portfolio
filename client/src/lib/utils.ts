import { QueryClient } from "@tanstack/react-query";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const CLOUDINARY_REGEX =
	/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 10,
			refetchOnWindowFocus: true,
			gcTime: 5 * 60 * 1000,
		},
	},
});

export function getOptimizedImageUrl(
	url: string | undefined | null,
	width: number,
	height?: number,
): string | undefined {
	if (!url) return undefined;

	const match = url.match(CLOUDINARY_REGEX);
	if (!match) return url;

	const base = match[1];
	const rest = url.slice(base.length);
	const h = height ?? width;
	const transform = `w_${width},h_${h},c_fill,q_auto,f_auto,e_auto_enhance:enhance-colors_true`;
	return `${base}${transform}/${rest}`;
}

export function getBlurPlaceholderUrl(
	url: string | undefined | null,
): string | undefined {
	if (!url) return undefined;

	const cloudinary = url.match(CLOUDINARY_REGEX);
	if (cloudinary) {
		const base = cloudinary[1];
		const rest = url.slice(base.length);
		return `${base}w_20,e_blur:1000,q_auto,f_webp/${rest}`;
	}

	if (url.startsWith("https://images.unsplash.com/")) {
		const separator = url.includes("?") ? "&" : "?";
		return `${url}${separator}w=20&blur=100&auto=format`;
	}

	return undefined;
}

export function initials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export const PAGE_SIZE = 6;

const range = (start: number, end: number) =>
	end < start
		? []
		: Array.from({ length: end - start + 1 }, (_, i) => start + i);

export function getPageNumbers(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	if (total <= 7) return range(1, total);

	const pages: (number | "ellipsis")[] = [1];
	if (current > 3) pages.push("ellipsis");

	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 2);
	pages.push(...range(start, end));

	if (current < total - 2) pages.push("ellipsis");
	pages.push(total);

	return pages;
}



