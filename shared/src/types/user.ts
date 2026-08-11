export interface UserProfile {
  _id: string
  email: string
  emailVerified: boolean
  role: 'admin' | 'super_admin'
  isSuspended?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}
