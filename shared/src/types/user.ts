import type { UserRole } from '../schemas/auth.js'

export interface UserProfile {
  _id: string
  email: string
  emailVerified: boolean
  role: UserRole
  isSuspended?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}