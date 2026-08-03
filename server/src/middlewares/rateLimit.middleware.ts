import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import { auth } from '../services/better-auth.js'

const FIFTEEN_MINUTES = 15 * 60 * 1000

const keyGenerator = async (req: Request): Promise<string> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  if (session?.user.id) {
    return `session:${session.user.id}`
  }
  return `ip:${ipKeyGenerator(req.ip ?? 'unknown')}`
}

const baseOptions = (max: number, windowMs: number) => ({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
})

export const globalLimiter = rateLimit({
  ...baseOptions(100, FIFTEEN_MINUTES),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
})

export const strictLimiter = rateLimit({
  ...baseOptions(10, FIFTEEN_MINUTES),
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
})

export const customRateLimiter = (max: number, windowMinutes: number = 15) =>
  rateLimit({
    ...baseOptions(max, windowMinutes * 60 * 1000),
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  })
