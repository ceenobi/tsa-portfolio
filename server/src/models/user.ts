import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  emailVerified: boolean
  role: 'admin' | 'super_admin'
  isSuspended?: boolean
  lastLoginAt?: Date
  failedLoginAttempts: number
  lockoutUntil?: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
    isSuspended: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

UserSchema.index({ role: 1 })
UserSchema.index({ isOnboarded: 1 })
UserSchema.index({ resetPasswordToken: 1 })

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'user')

export default User
