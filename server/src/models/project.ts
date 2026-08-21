import { PROJECT_DEPARTMENTS, PROJECT_STATUS } from "@tsa/shared";
import mongoose, { type Document, Schema } from "mongoose";

export interface ITeamMember {
	fullName: string;
	image?: string;
}

export interface IProjectLinks {
	url?: string;
	github?: string;
	figma?: string;
}

export interface IProject extends Document {
	_id: mongoose.Types.ObjectId;
	title: string;
	department: (typeof PROJECT_DEPARTMENTS)[number][];
	cohort: string;
	academicYear: string;
	description: string;
	thumbnail: string;
	coverImage: string;
	media: {
		mediaUrl: string;
		publicId: string;
	}[];
	teamMembers: ITeamMember[];
	links?: IProjectLinks;
	status: (typeof PROJECT_STATUS)[number];
	createdBy: mongoose.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
	{
		fullName: { type: String, required: true, trim: true },
		image: { type: String },
	},
	{ _id: false },
);

const ProjectLinksSchema = new Schema<IProjectLinks>(
	{
		url: { type: String },
		github: { type: String },
		figma: { type: String },
	},
	{ _id: false },
);

const ProjectSchema = new Schema<IProject>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		department: {
			type: [String],
			enum: PROJECT_DEPARTMENTS,
			required: true,
			validate: {
				validator: (v: string[]) => Array.isArray(v) && v.length > 0,
				message: "Select at least one department",
			},
		},
		cohort: {
			type: String,
			required: true,
			trim: true,
		},
		academicYear: {
			type: String,
			required: true,
			match: [/^\d{4}$/, "Enter a valid academic year (e.g. 2024)"],
		},
		description: {
			type: String,
			required: true,
			maxlength: 2000,
		},
		thumbnail: {
			type: String,
			required: true,
		},
		coverImage: {
			type: String,
			required: true,
		},
		media: {
			type: [
				{
					mediaUrl: String,
					publicId: String,
				},
			],
			required: true,
			maxlength: 10,
		},
		teamMembers: {
			type: [TeamMemberSchema],
			validate: {
				validator: (v: ITeamMember[]) => v.length <= 20,
				message: "You can add up to 20 team members",
			},
			default: [],
		},
		links: {
			type: ProjectLinksSchema,
		},
		status: {
			type: String,
			enum: PROJECT_STATUS,
			default: "draft",
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Indexes — supports the showcase's department filter and cohort grouping,
// and the "Most Recent"/"Oldest" sort (uses createdAt from timestamps).
ProjectSchema.index({ department: 1, createdAt: -1 });
ProjectSchema.index({ cohort: 1 });
// Enforces a unique project per cohort + academic year at the DB level.
ProjectSchema.index({ title: 1, cohort: 1, academicYear: 1 }, { unique: true });

const Project =
	mongoose.models.Project ||
	mongoose.model<IProject>("Project", ProjectSchema, "project");

export default Project;
