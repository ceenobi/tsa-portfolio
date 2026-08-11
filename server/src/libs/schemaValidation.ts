import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email({ message: 'Complete this field to continue' }),
  password: z
    .string({
      message: 'Complete this field to continue',
    })
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    })
    .regex(/\d/, {
      message: 'Password must contain at least one number',
    }),
})

export const loginSchema = z.object({
  email: z.email({ message: 'Complete this field to continue' }),
  password: z
    .string({
      message: 'Complete this field to continue',
    })
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    })
    .regex(/\d/, {
      message: 'Password must contain at least one number',
    }),
})

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Complete this field to continue' }),
})

export const resetPasswordSchema = z.object({
  password: z
    .string({
      message: 'Complete this field to continue',
    })
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    })
    .regex(/\d/, {
      message: 'Password must contain at least one number',
    }),
})

export const verifyEmailSchema = z.object({
  otp: z.string({ message: 'Complete this field to continue' }).length(6, { message: 'OTP must be 6 digits' }),
})

export const resendOtpSchema = z.object({
  email: z.email({ message: 'Complete this field to continue' }),
})

export const UploadSchema = z.object({
  files: z.array(z.string()).min(1, {
    message: "At least one file is required",
  }),
  folder: z.string().min(1, {
    message: "Folder is required",
  }),
});

export const DeleteMediaSchema = z.object({
  mediaIds: z.array(z.string()),
});

