import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resendOtpSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '@tsa/shared';
import { Router } from 'express';
import {
    forgotPassword,
    getUser,
    loginUser,
    logoutUser,
    registerAccount,
    resendOtp,
    resetPassword,
    verifyEmail,
} from '../controllers/auth.controller.js';
import { verifySession } from '../middlewares/auth.middleware.js';
import { strictLimiter } from '../middlewares/rateLimit.middleware.js';
import { validateFormData } from '../middlewares/schema.middleware.js';

const router = Router()

router.post('/register', strictLimiter, validateFormData(registerSchema), registerAccount)
router.post('/login', strictLimiter, validateFormData(loginSchema), loginUser)
router.post('/forgot-password', strictLimiter, validateFormData(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', strictLimiter, validateFormData(resetPasswordSchema), resetPassword)
router.post('/verify-account', strictLimiter, validateFormData(verifyEmailSchema), verifyEmail)
router.post('/resend-otp', strictLimiter, validateFormData(resendOtpSchema), resendOtp)
router.post('/logout', verifySession, logoutUser)

router.get('/me', verifySession, getUser)

export default router
