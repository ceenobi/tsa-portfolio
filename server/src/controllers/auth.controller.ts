import type {
    AuthResponse,
    ForgotPasswordResponse,
    GetUserResponse,
    LogoutResponse,
    ResendOtpResponse,
    ResetPasswordResponse,
    UserProfile,
    VerifyEmailResponse,
} from '@tsa/shared';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { env } from '../config/keys.js';
import logger from '../config/logger.js';
import { sendTsRestError, sendTsRestSuccess } from '../libs/responseHandler.js';
import tryCatchWrapper from '../libs/tryCatchWrapper.js';
import { generateOTP, generateResetToken, getOtpExpiry, getTokenExpiry, hashToken } from '../libs/utils.js';
import User from '../models/user.js';
import { EmailService } from '../services/emailService.js';

export const registerAccount = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body
  const existingUser = await User.findOne({ email }).lean()
  if (existingUser) {
    return sendTsRestError(res, 409, 'An account with this email already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const otp = generateOTP()
  const otpExpiry = getOtpExpiry()

  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    otp: { code: otp, expiresAt: otpExpiry, attempts: 0 },
    otpLastSentAt: new Date(),
  })

  const verificationLink = `${env.CLIENT_URL}/auth/verify-email?email=${encodeURIComponent(user.email)}`
  await EmailService.sendVerifyAccountEmail({ user, otp, link: verificationLink })

  logger.info({ userId: user._id }, 'New account registered')
  req.session.userId = user._id.toString()
  req.session.role = user.role

  return sendTsRestSuccess<AuthResponse['body']>(res, 201, {
    success: true,
    message: 'Account created. Please check your email to verify your account.',
    body: {
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
      },
    },
  })
})

export const loginUser = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return sendTsRestError(res, 400, 'Account not found')
  }

  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const minutesRemaining = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000)
    return sendTsRestError(res, 403, `Account locked. Try again in ${minutesRemaining} minute(s).`)
  }

  if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
    user.lockoutUntil = undefined
    user.failedLoginAttempts = 0
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1

    if (user.failedLoginAttempts >= 5) {
      user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000)
      user.failedLoginAttempts = 0
      await user.save()
      return sendTsRestError(res, 403, 'Account locked due to too many failed attempts. Try again in 30 minutes.')
    }

    await user.save()
    return sendTsRestError(res, 401, 'Incorrect credentials')
  }

  user.failedLoginAttempts = 0
  user.lastLoginAt = new Date()
  await user.save()

  req.session.userId = user._id.toString()
  req.session.role = user.role

  return sendTsRestSuccess<AuthResponse['body']>(res, 200, {
    success: true,
    message: 'Login successful',
    body: {
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
      },
    },
  })
})

export const forgotPassword = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return sendTsRestSuccess<ForgotPasswordResponse['body']>(res, 200, {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      body: { message: 'Check your email for the reset link.' },
    })
  }

  const resetToken = generateResetToken()
  const hashedToken = hashToken(resetToken)

  user.resetPasswordToken = hashedToken
  user.resetPasswordExpiresAt = getTokenExpiry(15)
  await user.save()

  const resetLink = `${env.CLIENT_URL}/auth/reset-password?token=${resetToken}`
  await EmailService.sendPasswordResetEmail({ user, resetLink })

  logger.info({ userId: user._id }, 'Password reset email sent')

  return sendTsRestSuccess<ForgotPasswordResponse['body']>(res, 200, {
    success: true,
    message: 'If an account with this email exists, a password reset link has been sent.',
    body: { message: 'Check your email for the reset link.' },
  })
})

export const resetPassword = tryCatchWrapper(async (req: Request, res: Response) => {
  const { password } = req.body
  const token = req.query.token || ''

  if (!token) {
    return sendTsRestError(res, 400, 'No token provided.')
  }
  const hashedToken = hashToken(token as string)
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+password')

  if (!user) {
    return sendTsRestError(res, 400, 'Invalid account or expired reset token.')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  user.password = hashedPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpiresAt = undefined
  user.failedLoginAttempts = 0
  user.lockoutUntil = undefined
  user.passwordChangedAt = new Date()
  await user.save()

  logger.info({ userId: user._id }, 'Password reset successful')

  return sendTsRestSuccess<ResetPasswordResponse['body']>(res, 200, {
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
    body: { message: 'Password updated.' },
  })
})

export const verifyEmail = tryCatchWrapper(async (req: Request, res: Response) => {
  const { otp } = req.body
  const email = req.query.email
  if (!email) {
    return sendTsRestError(res, 400, 'Email query params is missing.')
  }
  const user = await User.findOne({ email })
  if (!user) {
    return sendTsRestError(res, 400, 'Invalid account request.')
  }

  if (user.emailVerified) {
    return sendTsRestError(res, 400, 'Email is already verified.')
  }

  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    return sendTsRestError(res, 400, 'No OTP found. Request a new one.')
  }

  if (user.otp.expiresAt < new Date()) {
    return sendTsRestError(res, 400, 'OTP has expired. Request a new one.')
  }

  if (user.otp.attempts >= 5) {
    return sendTsRestError(res, 400, 'Too many failed attempts. Request a new OTP.')
  }

  if (user.otp.code !== otp) {
    user.otp.attempts += 1
    await user.save()

    const remaining = 5 - user.otp.attempts
    return sendTsRestError(res, 400, `Invalid OTP. ${remaining} attempt(s) remaining.`)
  }

  user.emailVerified = true
  user.otp = undefined
  user.otpLastSentAt = undefined
  await user.save()

  logger.info({ userId: user._id }, 'Email verified successfully')

  return sendTsRestSuccess<VerifyEmailResponse['body']>(res, 200, {
    success: true,
    message: 'Email verified successfully.',
    body: { message: 'You can now log in.' },
  })
})

export const resendOtp = tryCatchWrapper(async (req: Request, res: Response) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return sendTsRestError(res, 400, 'Account not found.')
  }

  if (user.emailVerified) {
    return sendTsRestError(res, 400, 'Email is already verified.')
  }

  if (user.otp && user.otp.expiresAt && user.otp.expiresAt > new Date()) {
    const remainingMinutes = Math.ceil((user.otp.expiresAt.getTime() - Date.now()) / 60000)
    return sendTsRestError(res, 400, `Current OTP is still valid. Try again in ${remainingMinutes} minute(s).`)
  }

  const otp = generateOTP()
  const otpExpiry = getOtpExpiry()

  user.otp = { code: otp, expiresAt: otpExpiry, attempts: 0 }
  user.otpLastSentAt = new Date()
  await user.save()

  const verificationLink = `${env.CLIENT_URL}/auth/verify-email?email=${encodeURIComponent(user.email)}`
  await EmailService.sendVerifyAccountEmail({ user, otp, link: verificationLink })

  logger.info({ userId: user._id }, 'New OTP sent')

  return sendTsRestSuccess<ResendOtpResponse['body']>(res, 200, {
    success: true,
    message: 'A new OTP has been sent to your email.',
    body: { message: 'Check your email for the verification code.' },
  })
})

export const getUser = tryCatchWrapper(async (req: Request, res: Response) => {
  const user = await User.findById(req.session.userId).lean()
  if (!user) {
    return sendTsRestError(res, 404, 'User not found')
  }
  return sendTsRestSuccess<GetUserResponse['body']>(res, 200, {
    success: true,
    message: 'User found',
    // Mongoose lean doc: convert ObjectId/Date fields to the serialized JSON shape.
    body: user as unknown as UserProfile,
  })
})

export const logoutUser = tryCatchWrapper(async (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      return sendTsRestError(res, 500, 'Failed to logout')
    }
    res.clearCookie('_tsaPortfolio')
    return sendTsRestSuccess<LogoutResponse['body']>(res, 200, {
      success: true,
      message: 'Logout successful',
      body: { message: 'Logout successful.' },
    })
  })
})
