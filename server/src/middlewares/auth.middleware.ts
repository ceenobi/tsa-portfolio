import { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@tsa/shared'
import { env } from '../config/keys.js'
import { sendTsRestError } from '../libs/responseHandler.js'

// User data attached to request after session verification
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string
        role: UserRole
        fullname: string
        email: string
        emailVerified?: boolean
      }
    }
  }
}

// Verify user is logged in (session exists)
export const verifySession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return sendTsRestError(res, 401, 'Access denied. Please log in.')
  }
  next()
}

// Verify user has specific role(s)
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check session exists
    if (!req.session?.userId) {
      return sendTsRestError(res, 401, 'Access denied. Please log in.')
    }

    // Check role if roles specified
    if (roles.length > 0 && !roles.includes(req.session.role as UserRole)) {
      return sendTsRestError(res, 403, 'Access denied. Insufficient permissions.')
    }
    next()
  }
}

// Verify the scheduled-job secret (cron endpoints)
export const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
  const cronSecret = req.headers['x-cron-secret']
  if (!cronSecret || cronSecret !== env.CRON_SECRET) {
    return sendTsRestError(res, 401, 'Unauthorized: invalid or missing CRON_SECRET')
  }
  next()
}
