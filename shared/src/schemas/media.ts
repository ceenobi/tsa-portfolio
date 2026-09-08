import { z } from 'zod';

export const UploadSchema = z.object({
  files: z.array(z.string()).min(1, {
    message: "At least one file is required",
  }),
  folder: z.string().min(1, {
    message: "Folder is required",
  }),
})

export const DeleteMediaSchema = z.object({
  mediaIds: z.array(z.string()).min(1, {
    message: "At least one media id is required",
  }),
})
