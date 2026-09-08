import { zodResolver } from "@hookform/resolvers/zod";
import { PROJECT_DEPARTMENTS } from "@tsa/shared";
import { ChevronRight, Plus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";
import { Seo } from "@/components/provider/seo";
import ActionBtn from "@/components/ui/action-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUploadFiles } from "@/hooks/use-create-project";
import {
	type EditProjectInput,
	useEditProject,
} from "@/hooks/use-edit-project";
import { useProject } from "@/hooks/use-project";

const formSchema = z.object({
	title: z.string().min(1, { message: "Project title is required" }),
	department: z.enum(PROJECT_DEPARTMENTS, {
		message: "Select a department",
	}),
	cohort: z.string().min(1, { message: "Cohort is required" }),
	academicYear: z
		.string()
		.regex(/^\d{4}$/, { message: "Enter a valid academic year (e.g. 2024)" }),
	description: z
		.string()
		.min(1, { message: "Project description is required" })
		.max(2000, { message: "Description must be at most 2000 characters" }),
	github: z.url({ message: "Enter a valid GitHub URL" }).or(z.literal("")),
	figma: z.url({ message: "Enter a valid Figma URL" }).or(z.literal("")),
	teamMembers: z
		.array(
			z.object({
				fullName: z.string().min(1, "Name is required"),
				image: z.string().optional(),
			}),
		)
		.max(20, { message: "You can add up to 20 team members" }),
});

type FormValues = z.infer<typeof formSchema>;

type ImagePick = { file: File; preview: string } | null;

function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

export default function EditProject() {
	const { portfolioId } = useParams<{ portfolioId: string }>();
	const navigate = useNavigate();
	const { data: project, isLoading: projectLoading } = useProject(portfolioId);
	const uploadFiles = useUploadFiles();
	const editProject = useEditProject(portfolioId!);

	const [thumbnail, setThumbnail] = useState<ImagePick>(null);
	const [cover, setCover] = useState<ImagePick>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [pending, setPending] = useState<null | "draft" | "published">(null);

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
	});

	// Pre-populate form once project data loads.
	useEffect(() => {
		if (!project) return;
		const p = project.project;
		reset({
			title: p.title ?? "",
			department:
				(p.category as (typeof PROJECT_DEPARTMENTS)[number]) ??
				"Full Stack Web Development",
			cohort: p.cohort ?? "",
			academicYear: p.year ?? "2024",
			description: p.description ?? "",
			github: p.links?.github ?? "",
			figma: p.links?.figma ?? "",
			teamMembers: (p.teamMembers ?? []).map((m) => ({
				fullName: m.name ?? "",
				image: m.avatarUrl ?? "",
			})),
		});
	}, [project, reset]);

	const { fields, append, remove } = useFieldArray({
		control,
		name: "teamMembers",
	});

	function pick(setter: (v: ImagePick) => void) {
		return (file: File | null) => {
			setImageError(null);
			setter(file ? { file, preview: URL.createObjectURL(file) } : null);
		};
	}

	async function submit(data: FormValues) {
		// Existing images from the project (fallback when user doesn't upload new ones).
		const existingThumb = project?.project?.media?.[0]?.mediaUrl;
		const existingCover = project?.project?.coverImageUrl;

		const hasExisting = Boolean(existingThumb || existingCover);
		const hasNew = Boolean(thumbnail || cover);

		if (!hasExisting && !hasNew) {
			setImageError("Please upload at least a thumbnail or cover image.");
			toast.error("Please upload at least a thumbnail or cover image.");
			return;
		}

		try {
			setPending("published");

			// Start with existing images as defaults.
			let thumbUp = existingThumb
				? { mediaUrl: existingThumb, publicId: "" }
				: undefined;
			let coverUp = existingCover
				? { mediaUrl: existingCover, publicId: "" }
				: undefined;

			// Upload new images if provided, replacing the defaults.
			const filesToUpload: string[] = [];
			if (thumbnail) {
				filesToUpload.push(await readAsDataUrl(thumbnail.file));
			}
			if (cover) {
				filesToUpload.push(await readAsDataUrl(cover.file));
			}

			if (filesToUpload.length > 0) {
				const uploaded = await uploadFiles.mutateAsync({
					files: filesToUpload,
					folder: "TSAPortfolio/projects",
				});
				let idx = 0;
				if (thumbnail) thumbUp = uploaded[idx++];
				if (cover) coverUp = uploaded[idx];
			}

			const payload: EditProjectInput = {
				title: data.title,
				department: [data.department],
				cohort: data.cohort,
				academicYear: data.academicYear,
				description: data.description,
				thumbnail: thumbUp?.mediaUrl ?? "",
				coverImage: coverUp?.mediaUrl ?? "",
				media: [thumbUp, coverUp].filter(Boolean) as {
					mediaUrl: string;
					publicId: string;
				}[],
				teamMembers: data.teamMembers.filter((m) => m.fullName.trim()),
				links: {
					github: data.github || undefined,
					figma: data.figma || undefined,
				},
				status: "published",
			};

			await editProject.mutateAsync(payload);
			toast.success("Project updated successfully");
			navigate("/dashboard/portfolio");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setPending(null);
		}
	}

	const busy = pending !== null;

	if (projectLoading) {
		return (
			<div className="container mx-auto mt-10 text-center text-mainGray">
				Loading project…
			</div>
		);
	}

	if (!project) {
		return (
			<div className="container mx-auto mt-10 text-center text-mainGray">
				Project not found.
			</div>
		);
	}

	return (
		<div className="">
			<Seo title="Edit Project - Techstudio Academy Portfolio" />

			<div className="mt-6 flex flex-col items-start gap-6">
				<nav className="flex items-center gap-1 text-base">
					<Link
						to="/dashboard/portfolio"
						className="hover:text-mainBlue text-[#6E6D6D]"
					>
						Portfolio
					</Link>
					<ChevronRight className="size-4" />
					<span className="text-[#000000]">Edit Project</span>
				</nav>
				<h1 className="text-xl font-semibold text-[#1D1D1D]">
					Edit Portfolio Project
				</h1>
			</div>

			<form
				onSubmit={handleSubmit(submit)}
				className="mt-16 space-y-16 container mx-auto max-w-4xl"
			>
				{/* Project Information */}
				<section className="space-y-6">
					<h2 className="font-semibold text-deepBlue text-xl">
						Project Information
					</h2>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div className="space-y-2.5">
							<Label
								htmlFor="title"
								className="text-base text-mainBlack font-semibold"
							>
								Project Title
							</Label>
							<Input
								id="title"
								placeholder="Enter project title"
								className="h-10"
								{...register("title")}
							/>
							{errors.title && (
								<p className="text-xs text-destructive">
									{errors.title.message}
								</p>
							)}
						</div>

						<div className="space-y-2.5">
							<Label className="text-base text-mainBlack font-semibold">
								Department
							</Label>
							<Controller
								control={control}
								name="department"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="h-13 py-4.5 w-full">
											<SelectValue placeholder="Department" />
										</SelectTrigger>
										<SelectContent>
											{PROJECT_DEPARTMENTS.map((d) => (
												<SelectItem key={d} value={d}>
													{d}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.department && (
								<p className="text-xs text-destructive">
									{errors.department.message}
								</p>
							)}
						</div>

						<div className="space-y-2.5">
							<Label
								htmlFor="cohort"
								className="text-base text-mainBlack font-semibold"
							>
								Cohort
							</Label>
							<Input
								id="cohort"
								placeholder="Enter cohort"
								className="h-10"
								{...register("cohort")}
							/>
							{errors.cohort && (
								<p className="text-xs text-destructive">
									{errors.cohort.message}
								</p>
							)}
						</div>

						<div className="space-y-2.5">
							<Label
								htmlFor="academicYear"
								className="text-base text-mainBlack font-semibold"
							>
								Academic Year
							</Label>
							<Input
								id="academicYear"
								placeholder="2024"
								className="h-10"
								{...register("academicYear")}
							/>
							{errors.academicYear && (
								<p className="text-xs text-destructive">
									{errors.academicYear.message}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-2.5">
						<Label
							htmlFor="description"
							className="text-base text-mainBlack font-semibold"
						>
							Project Description
						</Label>
						<textarea
							id="description"
							rows={9}
							placeholder="What's this project about?"
							className="w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
							{...register("description")}
						/>
						{errors.description && (
							<p className="text-xs text-destructive">
								{errors.description.message}
							</p>
						)}
					</div>
				</section>

				{/* Project Media */}
				<section className="space-y-6">
					<h2 className="font-semibold text-deepBlue text-xl">Project Media</h2>
					<div className="grid grid-cols-1 gap-7 sm:grid-cols-[1fr_2fr]">
						<UploadBox
							label="Project Thumbnail"
							hint="Square, min 800 x 800px"
							preview={thumbnail?.preview ?? null}
							existing={project?.project?.media?.[0]?.mediaUrl}
							onSelect={pick(setThumbnail)}
						/>
						<UploadBox
							label="Cover Image"
							hint="Landscape, min 1600 x 900px"
							preview={cover?.preview ?? null}
							existing={project?.project?.coverImageUrl}
							onSelect={pick(setCover)}
						/>
					</div>
					{imageError && (
						<p className="text-xs text-destructive">{imageError}</p>
					)}
				</section>

				{/* Team Members */}
				<section className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-deepBlue text-xl">
							Team Members
						</h2>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={() => fields.length < 20 && append({ fullName: "" })}
							className="border-[1.13px] h-10 border-mainBlue text-mainBlue px-4.5 py-2.5 rounded-[7px] flex items-center gap-1.5 text-base font-semibold"
						>
							<Plus className="size-6 text-mainBlue" /> Add Members
						</Button>
					</div>

					{fields.length === 0 ? (
						<p className="text-base text-mainBlack text-center">
							No contributors yet. Add up to 20.
						</p>
					) : (
						<ul className="space-y-3">
							{fields.map((f, i) => (
								<li key={f.id} className="flex items-start gap-3">
									<div className="flex-1 space-y-1.5">
										<Input
											placeholder="Full name"
											className="h-10"
											{...register(`teamMembers.${i}.fullName` as const)}
										/>
										{errors.teamMembers?.[i]?.fullName && (
											<p className="text-xs text-destructive">
												{errors.teamMembers[i]?.fullName?.message}
											</p>
										)}
										<div className="my-2 text-xs text-mainBlue">
											Image URL:
											<Input
												placeholder="https://..."
												className="h-6 rounded-md"
												{...register(`teamMembers.${i}.image` as const)}
											/>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-lg"
										aria-label="Remove member"
										onClick={() => remove(i)}
									>
										<X />
									</Button>
								</li>
							))}
						</ul>
					)}
				</section>

				{/* Project Links */}
				<section className="space-y-6">
					<h2 className="font-semibold text-deepBlue text-xl">Project Links</h2>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div className="space-y-2.5">
							<Label
								htmlFor="github"
								className="text-base text-mainBlack font-semibold"
							>
								GitHub
							</Label>
							<Input
								id="github"
								placeholder="https://github.com/..."
								className="h-10"
								{...register("github")}
							/>
							{errors.github && (
								<p className="text-xs text-destructive">
									{errors.github.message}
								</p>
							)}
						</div>
						<div className="space-y-2.5">
							<Label
								htmlFor="figma"
								className="text-base text-mainBlack font-semibold"
							>
								Figma
							</Label>
							<Input
								id="figma"
								placeholder="https://figma.com/..."
								className="h-10"
								{...register("figma")}
							/>
							{errors.figma && (
								<p className="text-xs text-destructive">
									{errors.figma.message}
								</p>
							)}
						</div>
					</div>
				</section>

				{/* Actions */}
				<div className="flex items-center justify-between">
					<ActionBtn
						type="button"
						variant="outline"
						size="lg"
						text="Cancel"
						disabled={busy}
						onClick={() => navigate(-1)}
						classname="h-10 px-6"
					/>
					<div className="flex gap-4 items-center">
						<ActionBtn
							type="button"
							variant="outline"
							size="lg"
							text="Save Draft"
							loading={pending === "draft"}
							disabled={busy}
							onClick={handleSubmit((d) => submit(d))}
							classname="h-10 px-6 border-mainBlue"
						/>
						<ActionBtn
							type="submit"
							size="lg"
							text="Update Project"
							loading={pending === "published"}
							disabled={busy}
							classname="h-10 bg-mainBlue px-6 text-white hover:bg-mainBlue/90"
						/>
					</div>
				</div>
			</form>
		</div>
	);
}

function UploadBox({
	label,
	hint,
	preview,
	existing,
	onSelect,
}: {
	label: string;
	hint: string;
	preview: string | null;
	existing?: string;
	onSelect: (file: File | null) => void;
}) {
	return (
		<div className="space-y-2.5">
			<p className="text-base text-mainBlack font-semibold">{label}</p>
			<label className="flex h-[250PX] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-input/20 transition-colors hover:border-mainBlue">
				{preview ? (
					<img
						src={preview}
						alt={label}
						className="h-full w-full object-cover"
					/>
				) : existing ? (
					<img
						src={existing}
						alt={label}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex flex-col items-center gap-4.5 px-4 text-center text-mainGray">
						<Upload className="size-10" />
						<div className="flex flex-col items-center gap-2 text-center">
							<span className="text-base font-semibold text-lightGray">
								Click to upload
							</span>
							<span className="text-base text-[#747474]">{hint}</span>
						</div>
					</div>
				)}
				<input
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
				/>
			</label>
		</div>
	);
}
