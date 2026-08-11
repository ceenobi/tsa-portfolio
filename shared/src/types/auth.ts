import type { ApiSuccessResponse } from './response.js';
import type { UserProfile } from './user.js';

export type AuthResponse = ApiSuccessResponse<{
  user: {
    email: string
    emailVerified: boolean
  }
}>

export type ForgotPasswordResponse = ApiSuccessResponse<{
  message: string
}>

export type ResetPasswordResponse = ApiSuccessResponse<{
  message: string
}>

export type VerifyEmailResponse = ApiSuccessResponse<{
  message: string
}>

export type ResendOtpResponse = ApiSuccessResponse<{
  message: string
}>

export type LogoutResponse = ApiSuccessResponse<{
  message: string
}>

export type GetUserResponse = ApiSuccessResponse<UserProfile>
