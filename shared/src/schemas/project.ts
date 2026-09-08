import { z } from "zod";

// Departments a project can belong to — keep in sync with the "Courses" filter
// in client/src/routes/main/home/project-showcase.tsx
export const PROJECT_DEPARTMENTS = [
	"Product Design",
	"Full Stack Web Development",
	"Data Analysis",
	"Cyber Security",
] as const;

export const PROJECT_STATUS = ["draft", "published"] as const;

export const teamMemberSchema = z.object({
	image: z.string().optional(),
	fullName: z.string({ message: "Complete this field to continue" }).min(1, {
		message: "Team member name is required",
	}),
});

export const projectLinksSchema = z.object({
	url: z.url({ message: "Enter a valid URL" }).optional().or(z.literal("")),
	github: z
		.url({ message: "Enter a valid GitHub URL" })
		.optional()
		.or(z.literal("")),
	figma: z
		.url({ message: "Enter a valid Figma URL" })
		.optional()
		.or(z.literal("")),
});

export const createProjectSchema = z.object({
	title: z.string({ message: "Complete this field to continue" }).min(1, {
		message: "Project title is required",
	}),
	department: z
		.array(z.enum(PROJECT_DEPARTMENTS), {
			message: "Select at least one department",
		})
		.min(1, { message: "Select at least one department" }),
	cohort: z.string({ message: "Complete this field to continue" }).min(1, {
		message: "Cohort is required",
	}),
	academicYear: z
		.string({ message: "Complete this field to continue" })
		.regex(/^\d{4}$/, { message: "Enter a valid academic year (e.g. 2024)" }),
	description: z
		.string({ message: "Complete this field to continue" })
		.min(1, { message: "Project description is required" })
		.max(2000, { message: "Description must be at most 2000 characters" }),
	thumbnail: z.string({ message: "Complete this field to continue" }).min(1, {
		message: "Project thumbnail is required",
	}),
	coverImage: z.string({ message: "Complete this field to continue" }).min(1, {
		message: "Cover image is required",
	}),
	media: z
		.array(
			z.object({
				mediaUrl: z.string().min(1, "Media URL is required"),
				publicId: z.string().min(1, "Public ID is required"),
			}),
		)
		.min(1, "At least one media item is required")
		.max(10, "Cannot have more than 10 media items"),
	teamMembers: z
		.array(teamMemberSchema)
		.max(20, { message: "You can add up to 20 team members" })
		.optional()
		.default([]),
	links: projectLinksSchema.optional(),
	status: z.enum(PROJECT_STATUS).optional().default("draft"),
});
