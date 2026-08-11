import { NextFunction, Request, Response } from 'express'
import { sendTsRestError } from '../libs/responseHandler.js'

// User data attached to request after session verification
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string
        role: 'admin' | 'super_admin'
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
export const requireRole = (...roles: ('admin' | 'super_admin')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check session exists
    if (!req.session?.userId) {
      return sendTsRestError(res, 401, 'Access denied. Please log in.')
    }

    // Check role if roles specified
    if (roles.length > 0 && !roles.includes(req.session.role as 'admin' | 'super_admin')) {
      return sendTsRestError(res, 403, 'Access denied. Insufficient permissions.')
    }
    next()
  }
}

// Verify user is admin
export const requireAdmin = requireRole('admin')

// Combine session + role verification
export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  verifySession(req, res, () => {
    requireRole('admin', 'super_admin')(req, res, next)
  })
}
