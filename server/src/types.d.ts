import { z } from 'zod'
import type { ApiSuccessResponse } from './libs/responseHandler.js'
import { forgotPasswordSchema, registerSchema, resendOtpSchema } from './libs/schemaValidation.ts';

export type AuthResponse = ApiSuccessResponse<{
  user: {
    email: z.infer<typeof registerSchema>['email']
    emailVerified: z.infer<typeof registerSchema>['emailVerified']
  }
}>

export type ForgotPasswordResponse = ApiSuccessResponse<{
  message: z.infer<typeof forgotPasswordSchema>['message']
}>

export type ResetPasswordResponse = ApiSuccessResponse<{
  message: string
}>

export type VerifyEmailResponse = ApiSuccessResponse<{
  message: string
}>

export type ResendOtpResponse = ApiSuccessResponse<{
  message: z.infer<typeof resendOtpSchema>['message']
}>

export type LogoutResponse = ApiSuccessResponse<{
  message: string
}>

export type GetUserResponse = ApiSuccessResponse<{
  user: IUser
}>
