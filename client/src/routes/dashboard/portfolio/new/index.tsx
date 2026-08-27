import { zodResolver } from "@hookform/resolvers/zod";
import { PROJECT_DEPARTMENTS } from "@tsa/shared";
import { ChevronRight, Plus, Upload, X } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
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
import {
  type CreateProjectInput,
  useCreateProject,
  useUploadFiles,
} from "client/src/hooks/use-create-project.ts";

// Form fields the admin types. Images are handled separately (uploaded on
// submit), and `department` is a single choice here that we send as an array.
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
    .array(z.object({ fullName: z.string().min(1, "Name is required") }))
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

export default function CreateProject() {
  const navigate = useNavigate();
  const uploadFiles = useUploadFiles();
  const createProject = useCreateProject();

  const [thumbnail, setThumbnail] = useState<ImagePick>(null);
  const [cover, setCover] = useState<ImagePick>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  // Which button is mid-submit, so only that one shows a spinner.
  const [pending, setPending] = useState<null | "draft" | "published">(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      cohort: "",
      academicYear: "2024",
      description: "",
      github: "",
      figma: "",
      teamMembers: [],
    },
  });

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

  async function submit(data: FormValues, status: "draft" | "published") {
    if (!thumbnail || !cover) {
      setImageError("Please upload both a thumbnail and a cover image.");
      toast.error("Please upload both a thumbnail and a cover image.");
      return;
    }

    try {
      setPending(status);
      const [thumbData, coverData] = await Promise.all([
        readAsDataUrl(thumbnail.file),
        readAsDataUrl(cover.file),
      ]);

      const uploaded = await uploadFiles.mutateAsync({
        files: [thumbData, coverData],
        folder: "TSAPortfolio/projects",
      });
      const [thumbUp, coverUp] = uploaded;

      const payload: CreateProjectInput = {
        title: data.title,
        department: [data.department],
        cohort: data.cohort,
        academicYear: data.academicYear,
        description: data.description,
        thumbnail: thumbUp.mediaUrl,
        coverImage: coverUp.mediaUrl,
        // The design has no separate gallery, so thumbnail + cover double
        // as the required media items (schema needs at least one).
        media: [thumbUp, coverUp],
        teamMembers: data.teamMembers.filter((m) => m.fullName.trim()),
        links: {
          github: data.github || undefined,
          figma: data.figma || undefined,
        },
        status,
      };

      await createProject.mutateAsync(payload);
      toast.success(
        status === "published" ? "Project published" : "Draft saved",
      );
      navigate("/dashboard/portfolio");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <div className="container mx-auto max-w-4xl">
      <Seo title="Add New Project - Techstudio Academy Portfolio" />

      {/* Breadcrumb + heading */}
      <nav className="flex items-center gap-1 text-sm text-mainGray">
        <Link to="/dashboard/portfolio" className="hover:text-mainBlue">
          Portfolio
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-mainBlack">Add New Project</span>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold text-mainBlack">
        Create Portfolio Project
      </h1>

      <form
        onSubmit={handleSubmit((d) => submit(d, "published"))}
        className="mt-8 space-y-12"
      >
        {/* Project Information */}
        <section className="space-y-5">
          <h2 className="font-semibold text-mainBlue">Project Information</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm text-mainBlack">
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

            <div className="space-y-1.5">
              <Label className="text-sm text-mainBlack">Department</Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 w-full">
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

            <div className="space-y-1.5">
              <Label htmlFor="cohort" className="text-sm text-mainBlack">
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

            <div className="space-y-1.5">
              <Label htmlFor="academicYear" className="text-sm text-mainBlack">
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

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm text-mainBlack">
              Project Description
            </Label>
            <textarea
              id="description"
              rows={5}
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
        <section className="space-y-5">
          <h2 className="font-semibold text-mainBlue">Project Media</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <UploadBox
              label="Project Thumbnail"
              hint="Square, min 800 x 800px"
              preview={thumbnail?.preview ?? null}
              onSelect={pick(setThumbnail)}
            />
            <UploadBox
              label="Cover Image"
              hint="Landscape, min 1600 x 900px"
              preview={cover?.preview ?? null}
              onSelect={pick(setCover)}
            />
          </div>
          {imageError && (
            <p className="text-xs text-destructive">{imageError}</p>
          )}
        </section>

        {/* Team Members */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-mainBlue">Team Members</h2>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fields.length < 20 && append({ fullName: "" })}
            >
              <Plus /> Add Members
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-mainGray">
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
        <section className="space-y-5">
          <h2 className="font-semibold text-mainBlue">Project Links</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="github" className="text-sm text-mainBlack">
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
            <div className="space-y-1.5">
              <Label htmlFor="figma" className="text-sm text-mainBlack">
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
        <div className="flex items-center justify-center gap-3 pb-10">
          <ActionBtn
            type="button"
            variant="outline"
            size="lg"
            text="Cancel"
            disabled={busy}
            onClick={() => navigate(-1)}
            classname="h-10 px-6"
          />
          <ActionBtn
            type="button"
            variant="outline"
            size="lg"
            text="Save Draft"
            loading={pending === "draft"}
            disabled={busy}
            onClick={handleSubmit((d) => submit(d, "draft"))}
            classname="h-10 px-6"
          />
          <ActionBtn
            type="submit"
            size="lg"
            text="Publish Project"
            loading={pending === "published"}
            disabled={busy}
            classname="h-10 bg-mainBlue px-6 text-white hover:bg-mainBlue/90"
          />
        </div>
      </form>
    </div>
  );
}

function UploadBox({
  label,
  hint,
  preview,
  onSelect,
}: {
  label: string;
  hint: string;
  preview: string | null;
  onSelect: (file: File | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-mainBlack">{label}</p>
      <label className="flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-input/20 transition-colors hover:border-mainBlue">
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-mainGray">
            <Upload className="size-6" />
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-xs">{hint}</span>
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
